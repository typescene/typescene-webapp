import { UIRenderable, UIRenderContext } from "typescene";
export declare type DOMRenderOutput = UIRenderContext.Output<UIRenderable, HTMLElement>;
export declare type DOMRenderCallback = UIRenderContext.RenderCallback<DOMRenderOutput>;
export declare class DOMRenderContext extends UIRenderContext {
    static scheduleRender<TResult>(callback: () => TResult, lowPriority?: boolean): Promise<TResult>;
    static createFixedRootElement(): HTMLElement;
    constructor(root?: HTMLElement);
    readonly root: HTMLElement;
    clear(): void;
    getRenderCallback(): DOMRenderCallback;
    private _placePage;
    private _placeModal;
    private _addModalContent;
    private _page?;
}
