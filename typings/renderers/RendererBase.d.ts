import { UIComponent, UIFocusRequestEvent, UIRenderEvent } from "typescene";
import { DOMRenderOutput } from "../DOMRenderContext";
/** @internal List of basic DOM events that can be propagated on all elements */
export declare const baseEventNames: string[];
/** @internal List of DOM events that should be propagated on control and form elements */
export declare const controlEventNames: string[];
export declare abstract class RendererBase<TComponent extends UIComponent, TElement extends HTMLElement> {
    constructor(component: TComponent);
    /** Target component */
    component: TComponent;
    /** Method that is called asynchronously after every time the component is rendered, can be overridden e.g. to add event handlers to a HTML element */
    protected afterRender(_out?: DOMRenderOutput): void;
    /** Propagate a DOM event to the UI component and stop its propagation in the DOM; can be overridden e.g. to read the latest value of an input element before emitting the event. */
    protected emitComponentEvent(e: Event, name?: string): void;
    /** Handle given render event by creating an element using the (overridden) `createElement` method if necessary, and storing the last render callback to enable the `updateElement` method */
    protected handleRenderEvent(e: UIRenderEvent<TComponent>): void;
    /** Handle given focus request event by focusing the current output element, or previous/next focusable siblings within the same parent component */
    protected handleFocusRequestEvent(e: UIFocusRequestEvent<TComponent>): void;
    /** Update the element that is rendered for the component. Updates rendered output after a first call to `handleRenderEvent`, otherwise does nothing except store given element for rendering later. */
    protected updateElement(element: TElement): void;
    /**
     * Add event handler(s) on the output element for given DOM events; the handler stops DOM propagation and calls `RenderBase.emitComponentEvent` to emit an event on the UI component (which is then propagated up the component tree).
     * Any previous event handlers set by this method for the same event name(s) are removed before adding them again.
     */
    protected propagateDOMEvents(events: string[]): void;
    private _domEventHandler;
    /** Returns the last rendered element, if any */
    protected getElement(): TElement | undefined;
    /** Returns true if the component has been rendered, and a HTML element exists */
    isRendered(): boolean;
    /** Must be overridden with a method that creates an HTML element for the rendered component, with initial styles and properties */
    protected abstract createElement(): TElement;
    private _lastRenderCallback?;
    private _renderedElement?;
}
