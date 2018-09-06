import { UIRenderable, UIRenderContext } from "typescene";
/** Specific type of output that is accepted by `DOMRenderContext` */
export declare type DOMRenderOutput = UIRenderContext.Output<UIRenderable, HTMLElement>;
/** Specific type of render callback that is returned by `DOMRenderContext.getRenderCallback` */
export declare type DOMRenderCallback = UIRenderContext.RenderCallback<DOMRenderOutput>;
/** DOM platform specific application render context */
export declare class DOMRenderContext extends UIRenderContext {
    /** Schedule a render/update callback in sync with other pending updates, if any */
    static scheduleRender<TResult>(callback: () => TResult, lowPriority?: boolean): Promise<TResult>;
    /** Create a container element that covers the entire window; used by the constructor if no DOM element is provided. */
    static createFixedRootElement(): HTMLElement;
    /** Create a new application render context that places elements within given root element */
    constructor(root?: HTMLElement);
    /** The root node that contains all rendered content (read-only) */
    readonly root: HTMLElement;
    /** Remove all content from the root node */
    clear(): void;
    /** Returns a callback that can be used to render a root DOM output element asynchronously. */
    getRenderCallback(): DOMRenderCallback;
    private _placePage;
    private _placeModal;
    /** Place an output element within given flex wrapper and position wrapper within its parent shader */
    private _addModalContent;
    private _page?;
}
/** @internal Remove given element asynchronously, possibly playing an animated transition first (for itself or for other element(s) provided) */
export declare function removeElement(elt: HTMLElement, ...transitionElts: Array<HTMLElement | null>): void;
