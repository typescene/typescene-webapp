import { UIComponent, UIFocusRequestEvent, UIRenderEvent } from "typescene";
import { DOMRenderOutput } from "../DOMRenderContext";
export declare abstract class RendererBase<TComponent extends UIComponent, TElement extends HTMLElement> {
    constructor(component: TComponent);
    component: TComponent;
    protected afterRender(_out?: DOMRenderOutput): void;
    protected emitComponentEvent(e: Event, name?: string): void;
    protected handleRenderEvent(e: UIRenderEvent<TComponent>): void;
    protected handleFocusRequestEvent(e: UIFocusRequestEvent<TComponent>): void;
    protected updateElement(element: TElement): void;
    protected propagateDOMEvents(events: string[]): void;
    private _domEventHandler;
    protected getElement(): TElement | undefined;
    isRendered(): boolean;
    protected abstract createElement(): TElement;
    private _lastRenderCallback?;
    private _renderedElement?;
}
