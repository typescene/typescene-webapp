import { UIComponent, UIFocusRequestEvent, UIFocusRequestType, UIRenderContext, UIRenderEvent } from "typescene";
import { BrowserApplication } from '../BrowserApplication';
import { DOMRenderCallback, DOMRenderContext, DOMRenderOutput } from "../DOMRenderContext";

/** @internal List of basic DOM events that can be propagated on all elements */
export const baseEventNames = [
    "click", "dblclick", "contextmenu", "mouseup", "mousedown",
    "keydown", "keypress", "keyup", "focusin", "focusout",
    "touchstart", "touchend"
];

/** @internal List of DOM events that should be propagated on control and form elements */
export const controlEventNames = [
    "change", "input", "copy", "cut", "paste"
];

/** Helper function to transform DOM event types to UI event names */
function domEventToUIEventName(e: Event) {
    return _names[e.type];
}
const _names: { [type: string]: string } = {
    "click": "Click",
    "dblclick": "DoubleClick",
    "contextmenu": "ContextMenu",
    "mouseup": "MouseUp",
    "mousedown": "MouseDown",
    "mouseenter": "MouseEnter",
    "mouseleave": "MouseLeave",
    "touchstart": "TouchStart",
    "touchend": "TouchEnd",
    "keydown": "KeyDown",
    "keyup": "KeyUp",
    "keypress": "KeyPress",
    "focusin": "FocusIn",
    "focusout": "FocusOut",
    "change": "Change",
    "input": "Input",
    "copy": "Copy",
    "cut": "Cut",
    "paste": "Paste"
};

/** Named key press events for `keydown` event key code */
const _keyUIEvents: { [keyCode: number]: string } = {
    13: "EnterKeyPress",
    32: "SpacebarPress",
    8: "BackspaceKeyPress",
    46: "DeleteKeyPress",
    27: "EscapeKeyPress",
    37: "ArrowLeftKeyPress",
    38: "ArrowUpKeyPress",
    39: "ArrowRightKeyPress",
    40: "ArrowDownKeyPress"
}

/** Last renderer where a touchstart occurred */
let _lastTouched: any;

export abstract class RendererBase<TComponent extends UIComponent, TElement extends HTMLElement> {
    constructor(component: TComponent) {
        this.component = component;
    }

    /** Target component */
    public component: TComponent;

    /** Method that is called asynchronously after every time the component is rendered, can be overridden e.g. to add event handlers to a HTML element */
    protected afterRender(_out?: DOMRenderOutput) {
        this.component.propagateComponentEvent("Rendered");
        let elt = this._renderedElement;
        if (elt && elt.dataset.transitionT === "revealing") {
            setTimeout(() => {
                if (elt!.dataset.transitionT === "revealing") {
                    elt!.dataset.transitionT = "revealed";
                }
            }, 0);
        }
    }

    /** Propagate a DOM event to the UI component and stop its propagation in the DOM; can be overridden e.g. to read the latest value of an input element before emitting the event. */
    protected emitComponentEvent(e: Event, name?: string) {
        if (e.type === "click" || e.type === "mousedown" || e.type === "mouseup") {
            if (DOMRenderContext.$touchData.last > Date.now() - 1000) return;
        }
        let uiEventName = name || domEventToUIEventName(e);
        this.component && this.component.propagateComponentEvent(uiEventName, undefined, e);
        if (uiEventName === "TouchStart") {
            DOMRenderContext.$touchData.last = Date.now();
            _lastTouched = this;
            this.component && this.component.propagateComponentEvent("MouseDown", undefined, e);
        }
        if (uiEventName === "TouchEnd") {
            DOMRenderContext.$touchData.last = Date.now();
            if (_lastTouched === this) {
                this.component && this.component.propagateComponentEvent("MouseUp", undefined, e);
                this.component && this.component.propagateComponentEvent("Click", undefined, e);
            }
        }
        if (uiEventName === "KeyDown") {
            let key = (e as KeyboardEvent).keyCode;
            let uiKeyEventName: string = key ? _keyUIEvents[key] : "";
            let ignore = false;
            if (uiKeyEventName === "EnterKeyPress") {
                let target: HTMLElement = e.target as any;
                let nodeName = String(target.nodeName).toLowerCase();
                ignore = (nodeName === "button" || nodeName === "textarea");
            }
            if (!ignore && uiKeyEventName) {
                setTimeout(() => {
                    this.component.propagateComponentEvent(uiKeyEventName, undefined, e);
                }, 0);
            }
        }
        e.stopPropagation();
    }

    /** Handle given render event by creating an element using the (overridden) `createElement` method if necessary, and storing the last render callback to enable the `updateElement` method */
    protected handleRenderEvent(e: UIRenderEvent<TComponent>) {
        if (e.source !== this.component) return;
        let element = this._renderedElement || (this._renderedElement = this.createElement());
        if (!BrowserApplication.transitionsDisabled) {
            let playReveal = !this._renderedElement;
            if (playReveal && this.component.revealTransition) {
                element.dataset.transitionReveal = this.component.revealTransition;
                element.dataset.transitionT = "revealing";
            }
            if (this.component.exitTransition) {
                element.dataset.transitionExit = this.component.exitTransition;
                element.dataset.transitionT = "revealing";
            }
        }
        let output = new UIRenderContext.Output(this.component, element);
        this.component.lastRenderOutput = output as any;
        this._lastRenderCallback = e.renderCallback(output, this.afterRender.bind(this));
    }

    /** Handle given focus request event by focusing the current output element, or previous/next focusable siblings within the same parent component */
    protected handleFocusRequestEvent(e: UIFocusRequestEvent<TComponent>) {
        if (e.source !== this.component) return;
        if (this.component.lastRenderOutput) {
            // focus element itself if focus type is `Self`
            let element: HTMLElement = this.component.lastRenderOutput.element;
            if (e.direction === UIFocusRequestType.SELF) {
                element.focus();
                return;
            }

            // check for parent element to find previous/next element to focus
            let parent = this.component.getParentComponent(UIComponent as any);
            let parentElement: HTMLElement | undefined = parent &&
                (parent instanceof UIComponent) &&
                parent.lastRenderOutput && parent.lastRenderOutput.element;
            if (!parentElement) return;

            // find focusable elements and focus closest before/after
            let focusable: HTMLElement[] = parentElement.querySelectorAll("[tabIndex]") as any;
            if (e.direction === UIFocusRequestType.REVERSE) {
                for (let i = focusable.length - 1; i >= 0; i--) {
                    if (element.compareDocumentPosition(focusable[i]) &
                        Node.DOCUMENT_POSITION_PRECEDING) {
                        let j = 0;
                        while (j < i) {
                            if (focusable[j].compareDocumentPosition(focusable[i]) &
                                Node.DOCUMENT_POSITION_CONTAINED_BY)
                                break;
                            j++;
                        }
                        focusable[j].focus();
                        return;
                    }
                }
            }
            else {
                for (let i = 0; i < focusable.length; i++) {
                    if (element.compareDocumentPosition(focusable[i]) &
                            Node.DOCUMENT_POSITION_FOLLOWING &&
                        !(element.compareDocumentPosition(focusable[i]) &
                            Node.DOCUMENT_POSITION_CONTAINED_BY)) {
                        focusable[i].focus();
                        return;
                    }
                }
            }
        }
    }

    /** Update the element that is rendered for the component. Updates rendered output after a first call to `handleRenderEvent`, otherwise does nothing except store given element for rendering later. */
    protected updateElement(element: TElement) {
        this._renderedElement = element;
        if (this._lastRenderCallback) {
            let output = new UIRenderContext.Output(this.component, element);
            this.component.lastRenderOutput = output as any;
            this._lastRenderCallback = this._lastRenderCallback.call(undefined,
                output, this.afterRender.bind(this));
        }
    }

    /**
     * Add event handler(s) on the output element for given DOM events; the handler stops DOM propagation and calls `RenderBase.emitComponentEvent` to emit an event on the UI component (which is then propagated up the component tree).
     * Any previous event handlers set by this method for the same event name(s) are removed before adding them again.
     */
    protected propagateDOMEvents(events: string[]) {
        let element = this._renderedElement;
        if (!element) return;
        for (let name of events) {
            try { element.removeEventListener(name, this._domEventHandler) }
            catch (all) { }
            element.addEventListener(name, this._domEventHandler);
        }
    }
    private _domEventHandler = this.emitComponentEvent.bind(this);

    /** Returns the last rendered element, if any */
    protected getElement() { return this._renderedElement }

    /** Returns true if the component has been rendered, and a HTML element exists */
    isRendered() {
        return !!this._lastRenderCallback && !!this._renderedElement;
    }

    /** Must be overridden with a method that creates an HTML element for the rendered component, with initial styles and properties */
    protected abstract createElement(): TElement;

    private _lastRenderCallback?: DOMRenderCallback;
    private _renderedElement?: TElement;
}
