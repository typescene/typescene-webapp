import { UIRenderable, UIStyle } from "typescene";
export declare class DOMContainerUpdater {
    constructor(element: HTMLElement, separator?: UIStyle.SeparatorOptions);
    setAsyncCreate(makeAsync?: boolean): void;
    setAnimationTimeMs(duration: number): void;
    setAnimationSpeed(speed: number): void;
    stop(): void;
    readonly element: HTMLElement;
    readonly separator?: UIStyle.SeparatorOptions;
    update(renderable: Iterable<UIRenderable>): void;
    private _makeSeparator;
    private _addChildComponent;
    private _getPlaceholder;
    private _animateElements;
    private _rendered?;
    private _stopped?;
    private _asyncChildren?;
    private _animationTimeMs?;
    private _animationSpeed?;
    private _updatePending?;
    private _content;
    private _animatePositions?;
}
