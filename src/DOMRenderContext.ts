import { AppActivity, logUnhandledException, UIComponent, UIRenderable, UIRenderContext, UIRenderPlacement, UITheme } from "typescene";

/** Default popover width (in pixels) */
const MIN_POPOVER_WIDTH = 140;

/** Default popover height (in pixels) */
const MIN_POPOVER_HEIGHT = 32;

/** Popover margin (in pixels) */
const POPOVER_GAP = 8;

/** Specific type of output that is accepted by `DOMRenderContext` */
export type DOMRenderOutput = UIRenderContext.Output<UIRenderable, HTMLElement>;

/** Specific type of render callback that is returned by `DOMRenderContext.getRenderCallback` */
export type DOMRenderCallback = UIRenderContext.RenderCallback<DOMRenderOutput>

/** Pending render callbacks, if any */
let _pendingRender: Array<() => void> | undefined;

/** Pending low-priority render callbacks, if any */
let _pendingNextRender: Array<() => void> | undefined;

/** Helper function that acts as an event handler to stop input focus outside the last (modal) element */
function detractFocus(this: HTMLElement, e: Event) {
    let layer: HTMLElement = this.lastChild as any;
    if (layer && e.target && e.target !== layer) {
        if (!(layer.compareDocumentPosition(e.target as any) & Node.DOCUMENT_POSITION_CONTAINED_BY)) {
            e.preventDefault();
            setTimeout(() => {
                let detractor = document.createElement("div");
                detractor.tabIndex = -1;
                layer.insertBefore(detractor, layer.firstChild);
                detractor.focus();
                layer.removeChild(detractor);
            }, 0);
        }
    }
}

/** DOM platform specific application render context */
export class DOMRenderContext extends UIRenderContext {
    /** Schedule a render/update callback in sync with other pending updates, if any */
    static scheduleRender<TResult>(callback: () => TResult, lowPriority?: boolean) {
        if (lowPriority && !_pendingNextRender) _pendingNextRender = [];
        if (!_pendingRender) {
            _pendingRender = [];
            let f = () => {
                // record start time and keep going until time runs out
                let t = Date.now();
                while (_pendingRender && _pendingRender.length || _pendingNextRender) {
                    while (_pendingRender && _pendingRender.length) {
                        _pendingRender.shift()!();

                        // if time ran out, reschedule after a while
                        // (browser will throttle if needed)
                        if (Date.now() - t > 30) {
                            setTimeout(() => { reschedule() }, 10);
                            return;
                        }
                    }

                    // take from low-priority callbacks if any
                    if (_pendingNextRender) {
                        let next = _pendingNextRender.shift()!;
                        if (!_pendingNextRender.length) _pendingNextRender = undefined;
                        _pendingRender = [ next ];
                    }
                }
                _pendingRender = undefined;
            }
            let reschedule = () => {
                if (typeof window.requestAnimationFrame === "function") {
                    window.requestAnimationFrame(f);
                }
                else {
                    setTimeout(f, 10);
                }
            }
            reschedule();
        }
        return new Promise<TResult>((resolve, reject) => {
            (lowPriority ? _pendingNextRender : _pendingRender)!.push(() => {
                try { resolve(callback()) }
                catch (err) { reject(err) }
            });
        });
    }

    /** Create a container element that covers the entire window; used by the constructor if no DOM element is provided. */
    static createFixedRootElement() {
        let result = document.createElement("app");
        result.className = "App__FixedRoot";
        result.style.background = UITheme.replaceColor("@background");
        result.style.color = UITheme.replaceColor("@text");
        document.body.appendChild(result);
        return result;
    }

    /** Create a new application render context that places elements within given root element */
    constructor(root?: HTMLElement) {
        super();

        // set or create root element
        if (!root) root = DOMRenderContext.createFixedRootElement();
        this.root = root;

        // add focus handler that blocks focus outside of modals
        root.removeEventListener("focusin", detractFocus, true);
        root.addEventListener("focusin", detractFocus, true);
    }

    /** The root node that contains all rendered content (read-only) */
    readonly root: HTMLElement;

    /** Remove all content from the root node */
    clear() {
        this.root.innerHTML = "";
    }

    /** Returns a callback that can be used to render a root DOM output element asynchronously. */
    getRenderCallback(): DOMRenderCallback {
        let result: DOMRenderCallback = (output, afterRender) => {
            if (!output) return result;
            if (output.placement === UIRenderPlacement.PAGE) {
                return this._placePage(output, afterRender);
            }
            return this._placeModal(output, afterRender);
        };
        return result;
    }

    private _placePage(output: DOMRenderOutput, afterRender?: (out?: DOMRenderOutput) => void) {
        let replacePage = (output: DOMRenderOutput) => {
            // TODO: ANIMATION
            if (this._page) {
                let after = this._page.element.nextSibling;
                this.root.insertBefore(output.element, after);
                if (this._page.element !== output.element) {
                    this.root.removeChild(this._page.element);
                }
            }
            else {
                this.root.insertBefore(output.element, this.root.firstChild);
            }
            this._page = output;
            let activity = output.source.getParentComponent(AppActivity);
            while (activity && !activity.name) activity = activity.getParentActivity();
            if (activity && activity.name) document.title = activity.name;
        }

        // render element asynchronously and call callback
        let lastOutput: DOMRenderOutput | undefined = output;
        DOMRenderContext.scheduleRender(() => {
            if (this._page !== output) replacePage(output);
            return output;
        }).then(afterRender).catch(logUnhandledException);

        // provide update callback
        let update: DOMRenderCallback = (output, afterRender) => {
            // switch to modal renderer if needed
            if (output && output.placement !== UIRenderPlacement.PAGE) {
                if (lastOutput) this.root.removeChild(lastOutput.element);
                return this._placeModal(output, afterRender);
            }

            // otherwise schedule page rendering
            DOMRenderContext.scheduleRender(() => {
                if (this._page === lastOutput) {
                    if (!output) {
                        // remove last output
                        if (lastOutput) this.root.removeChild(lastOutput.element);
                        lastOutput = this._page = undefined;
                    }
                    else {
                        // replace the current page
                        replacePage(output);
                        lastOutput = output;
                    }
                }
                return output;
            }).then(afterRender).catch(logUnhandledException);
            return output ? update : this.getRenderCallback();
        };
        return update;
    }

    private _placeModal(output: DOMRenderOutput, afterRender?: (out?: DOMRenderOutput) => void) {
        // create shader that encapsulates the modal content
        let shader = document.createElement("div");
        let clickToClose = !!output.modalShadeClickToClose;
        shader.className = "App__ModalShader";
        shader.tabIndex = 0;
        shader.addEventListener("click", e => {
            if (e.target === shader || e.target === wrapper) {
                e.stopPropagation();
                if (clickToClose && (output.source instanceof UIComponent)) {
                    output.source.propagateComponentEvent("CloseModal");
                }
            }
        }, true);
        shader.addEventListener("keydown", e => {
            if (e.keyCode === 27) {
                e.stopPropagation();
                if (output.source instanceof UIComponent) {
                    output.source.propagateComponentEvent("EscapeKeyPress", undefined, e);
                    output.source.propagateComponentEvent("CloseModal");
                }
            }
            else if (output.source instanceof UIComponent) {
                if (e.keyCode === 37) {
                        output.source.propagateComponentEvent("ArrowLeftKeyPress", undefined, e);
                }
                else if (e.keyCode === 38) {
                        output.source.propagateComponentEvent("ArrowUpKeyPress", undefined, e);
                }
                else if (e.keyCode === 39) {
                        output.source.propagateComponentEvent("ArrowRightKeyPress", undefined, e);
                }
                else if (e.keyCode === 40) {
                        output.source.propagateComponentEvent("ArrowDownKeyPress", undefined, e);
                }
            }
        }, true);

        // create content wrapper for flex placement
        let wrapper = document.createElement("div");
        wrapper.className = "App__ModalWrapper";
        wrapper.setAttribute("aria-modal", "true");
        shader.appendChild(wrapper);

        // render element asynchronously and call callback
        let lastOutput: DOMRenderOutput | undefined = output;
        let lastFocused = document.activeElement;
        DOMRenderContext.scheduleRender(() => {
            this._addModalContent(wrapper, output);
            this.root.appendChild(shader);
            function setFocus() {
                if (!document.activeElement ||
                    !(shader.compareDocumentPosition(document.activeElement) &
                        Node.DOCUMENT_POSITION_CONTAINED_BY)) {
                    shader.focus();
                }
            }
            setTimeout(setFocus, 0);
            setTimeout(setFocus, 10);
            setTimeout(setFocus, 100);
            setTimeout(() => { shader.dataset.transitionT = "revealed" }, 0);
            return output;
        }).then(afterRender).catch(logUnhandledException);

        // provide update callback
        let update: DOMRenderCallback = (output, afterRender) => {
            // switch to page renderer if needed
            if (output && output.placement === UIRenderPlacement.PAGE) {
                this.root.removeChild(shader);
                return this._placePage(output, afterRender);
            }

            // otherwise schedule rendering as modal
            DOMRenderContext.scheduleRender(() => {
                if (!output) {
                    shader.style.background = "";
                    removeElement(shader, wrapper.firstChild as any);
                    lastOutput = undefined;
                    if (lastFocused) {
                        try { (lastFocused as HTMLElement).focus() }
                        catch { }
                    }
                }
                else {
                    this._addModalContent(wrapper, output);
                    clickToClose = !!output.modalShadeClickToClose;
                    lastOutput = output;
                }
                return output;
            }).then(afterRender).catch(logUnhandledException);
            return output ? update : this.getRenderCallback();
        };
        return update;
    }

    /** Place an output element within given flex wrapper and position wrapper within its parent shader */
    private _addModalContent(wrapper: HTMLElement, output: DOMRenderOutput) {
        // clear existing content
        let cur = wrapper.firstChild;
        while (cur) {
            if (!(cur as HTMLElement).dataset ||
                !(cur as HTMLElement).dataset.uiRemoved) {
                wrapper.removeChild(cur);
            }
            // TODO: shouldn't need to cast here
            // https://github.com/Microsoft/TypeScript/issues/28551
            cur = cur.nextSibling as typeof cur;
        }

        // darken shader after rendering
        setTimeout(() => {
            let perc = (output.modalShadeOpacity || 0) * 100 + "%";
            let color = UITheme.replaceColor("@modalShade/" + perc);
            let shader: HTMLElement = wrapper.parentNode as any;
            if (shader) shader.style.backgroundColor = color;
        }, 0);

        // add content and reset/handle placement
        wrapper.appendChild(output.element);
        wrapper.style.cssText = "";
        let refOut = output.placementRef && output.placementRef.lastRenderOutput;
        let refElt = refOut && refOut.element;
        let refRect = refElt && (refElt as HTMLElement).getBoundingClientRect &&
            (refElt as HTMLElement).getBoundingClientRect();
        switch (output.placement) {
            case UIRenderPlacement.DROPDOWN:
            case UIRenderPlacement.DROPDOWN_COVER:
                // dropdown wrapper: full size unless gravity left/right
                wrapper.style.position = "absolute";
                if (!refRect) break;
                wrapper.style.top = output.placement === UIRenderPlacement.DROPDOWN ?
                    (refRect.bottom + "px") : (refRect.top + "px");
                wrapper.style.left = refRect.left + "px";
                wrapper.style.width = refRect.width + "px";
                wrapper.style.flexDirection = "column";
                wrapper.style.opacity = "0";
                setTimeout(() => { fixVertical(wrapper, refRect.top) }, 0);
                break;
            case UIRenderPlacement.POPOVER:
                // popover wrapper below ref: center by default
                wrapper.style.position = "absolute";
                if (!refRect) break;
                let midX1 = (refRect.left + refRect.right) / 2;
                wrapper.style.top = (refRect.bottom + POPOVER_GAP) + "px";
                wrapper.style.left = (midX1 - MIN_POPOVER_WIDTH / 2) + "px";
                wrapper.style.width = MIN_POPOVER_WIDTH + "px";
                wrapper.style.flexDirection = "column";
                wrapper.style.opacity = "0";
                setTimeout(() => { fixVertical(wrapper) }, 0);
                break;
            case UIRenderPlacement.POPOVER_ABOVE:
                // popover wrapper above ref: center by default
                wrapper.style.position = "relative";
                if (!refRect) break;
                let midX2 = (refRect.left + refRect.right) / 2;
                wrapper.style.top = (refRect.top - POPOVER_GAP) + "px";
                wrapper.style.height = "0px";
                wrapper.style.left = (midX2 - MIN_POPOVER_WIDTH / 2) + "px";
                wrapper.style.width = MIN_POPOVER_WIDTH + "px";
                wrapper.style.flexDirection = "column";
                wrapper.style.justifyContent = "flex-end";
                wrapper.style.flexGrow = "0";
                wrapper.style.opacity = "0";
                setTimeout(() => { fixVertical(wrapper) }, 0);
                break;
            case UIRenderPlacement.POPOVER_LEFT:
                // popover wrapper to left of ref: center vertically
                wrapper.style.position = "absolute";
                if (!refRect) break;
                let midY1 = (refRect.top + refRect.bottom) / 2;
                wrapper.style.top = (midY1 - MIN_POPOVER_HEIGHT / 2) + "px";
                wrapper.style.height = MIN_POPOVER_HEIGHT + "px";
                wrapper.style.left = (refRect.left - POPOVER_GAP) + "px";
                wrapper.style.width = "0px";
                wrapper.style.flexDirection = "row";
                wrapper.style.alignItems = "center";
                wrapper.style.justifyContent = "flex-end";
                wrapper.style.opacity = "0";
                setTimeout(() => { fixHorizontal(wrapper) }, 0);
                break;
            case UIRenderPlacement.POPOVER_RIGHT:
                // popover wrapper to right of ref: center vertically
                wrapper.style.position = "absolute";
                if (!refRect) break;
                let midY2 = (refRect.top + refRect.bottom) / 2;
                wrapper.style.top = (midY2 - MIN_POPOVER_HEIGHT / 2) + "px";
                wrapper.style.height = MIN_POPOVER_HEIGHT + "px";
                wrapper.style.left = (refRect.right + POPOVER_GAP) + "px";
                wrapper.style.width = "0px";
                wrapper.style.flexDirection = "row";
                wrapper.style.alignItems = "center";
                wrapper.style.justifyContent = "flex-start";
                wrapper.style.opacity = "0";
                setTimeout(() => { fixHorizontal(wrapper) }, 0);
                break;
            case UIRenderPlacement.DRAWER:
                // drawer wrapper: gravity pulls to left/right
                wrapper.style.flexDirection = "column";
                wrapper.style.alignItems = "start";
                wrapper.style.justifyContent = "space-around";
                break;
            case UIRenderPlacement.DIALOG:
            default:
                // dialog wrapper: gravity pulls to top/center/bottom
                wrapper.style.flexDirection = "row";
                wrapper.style.alignItems = "center";
                wrapper.style.justifyContent = "space-around";
        }
    }

    private _page?: DOMRenderOutput;
}

/** Helper function to fix positioning of a dropdown menu or vertical popover */
function fixVertical(wrapper: HTMLElement, altBottom = -1) {
    let element: HTMLElement | undefined = wrapper.firstChild as any;
    if (element && element.dataset && element.dataset.transitionT === "revealing") {
        wrapper.style.opacity = "";
        let checkAgain = () => {
            element!.removeEventListener("animationend", checkAgain);
            element!.removeEventListener("animationcancel", checkAgain);
            element!.removeEventListener("transitionend", checkAgain);
            element!.removeEventListener("transitioncancel", checkAgain);
            fixVertical(wrapper, altBottom);
        };
        element.addEventListener("animationend", checkAgain);
        element.addEventListener("animationcancel", checkAgain);
        element.addEventListener("transitionend", checkAgain);
        element.addEventListener("transitioncancel", checkAgain);
        setTimeout(() => {
            DOMRenderContext.scheduleRender(checkAgain);
        }, 1000);
        return;
    }
    let rect = (element || wrapper).getBoundingClientRect();
    if (rect.left < 0) {
        wrapper.style.left = "0px";
        wrapper.style.width = rect.width > window.innerWidth ? rect.width + "px" : "auto";
    }
    else if (rect.right > window.innerWidth) {
        wrapper.style.left = Math.max(0, (window.innerWidth - rect.width)) + "px";
        wrapper.style.width = rect.width + "px";
    }
    if (rect.top < 0) {
        wrapper.style.top = "0px";
        wrapper.style.bottom = "";
        wrapper.style.justifyContent = "flex-start";
    }
    else if (rect.bottom > window.innerHeight) {
        if (altBottom > 0 && rect.height < altBottom) {
            wrapper.style.top = altBottom + "px";
            wrapper.style.height = "0px";
            wrapper.style.justifyContent = "flex-end";
        }
        else if (rect.height < window.innerHeight) {
            wrapper.style.bottom = "0px";
            wrapper.style.top = "";
            wrapper.style.justifyContent = "flex-end";
        }
        else {
            wrapper.style.top = "0px";
            wrapper.style.bottom = "";
            wrapper.style.justifyContent = "flex-start";
        }
    }
    wrapper.style.opacity = "";
}

/** Helper function to fix positioning of a horizontal popover */
function fixHorizontal(wrapper: HTMLElement) {
    let element: HTMLElement | undefined = wrapper.firstChild as any;
    if (element && element.dataset && element.dataset.transitionT === "revealing") {
        wrapper.style.opacity = "";
        let checkAgain = () => {
            element!.removeEventListener("animationend", checkAgain);
            element!.removeEventListener("animationcancel", checkAgain);
            element!.removeEventListener("transitionend", checkAgain);
            element!.removeEventListener("transitioncancel", checkAgain);
            fixHorizontal(wrapper);
        };
        element.addEventListener("animationend", checkAgain);
        element.addEventListener("animationcancel", checkAgain);
        element.addEventListener("transitionend", checkAgain);
        element.addEventListener("transitioncancel", checkAgain);
        setTimeout(() => {
            DOMRenderContext.scheduleRender(checkAgain);
        }, 1000);
        return;
    }
    let rect = (element || wrapper).getBoundingClientRect();
    if (rect.left < 0) {
        wrapper.style.left = "0px";
        wrapper.style.width = rect.width > window.innerWidth ? rect.width + "px" : "auto";
        wrapper.style.justifyContent = "flex-start";
    }
    else if (rect.right > window.innerWidth) {
        wrapper.style.left = Math.max(0, (window.innerWidth - rect.width)) + "px";
        wrapper.style.width = rect.width + "px";
        wrapper.style.justifyContent = "flex-end";
    }
    if (rect.top < 0) {
        wrapper.style.top = "0px";
        wrapper.style.bottom = "";
        wrapper.style.height = rect.height + "px";
    }
    else if (rect.bottom > window.innerHeight) {
        wrapper.style.top = Math.max(0, (window.innerHeight - rect.height)) + "px";
        wrapper.style.bottom = "";
        wrapper.style.height = rect.height + "px";
    }
    wrapper.style.opacity = "";
}

/** @internal Remove given element asynchronously, possibly playing an animated transition first (for itself or for other element(s) provided) */
export function removeElement(elt: HTMLElement, ...transitionElts: Array<HTMLElement | null>) {
    let parent = elt.parentNode;
    if (!parent) return;

    // add attribute first so the elements can be skipped over
    elt.dataset.uiRemoved = "removed";

    // set handler to wait for removal/animation
    let nTransitions = 0, timer: any;
    function checkRemove (this: HTMLElement | void) {
        this && this.removeEventListener("animationend", checkRemove);
        this && this.removeEventListener("animationcancel", checkRemove);
        this && this.removeEventListener("transitionend", checkRemove);
        this && this.removeEventListener("transitioncancel", checkRemove);
        if (this !== elt && --nTransitions > 0) return;
        if (elt.parentNode === parent) parent!.removeChild(elt);
        if (timer) clearTimeout(timer);
    };
    function checkTransition (elt: HTMLElement | null) {
        if (elt && elt.dataset.transitionExit) {
            elt.addEventListener("animationend", checkRemove);
            elt.addEventListener("animationcancel", checkRemove);
            elt.addEventListener("transitionend", checkRemove);
            elt.addEventListener("transitioncancel", checkRemove);
            elt.dataset.transitionT = "exiting";
            nTransitions++;
        }
    }
    checkTransition(elt);
    transitionElts.forEach(checkTransition);
    if (nTransitions) {
        // set fallback timeout for if end/cancel events fail
        timer = setTimeout(() => { nTransitions = 0; checkRemove() }, 2000);
    }
    else {
        // if no transitions found, remove right away
        Promise.resolve().then(() => checkRemove());
    }
}
