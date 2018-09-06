import { UIRenderable, UIStyle } from "typescene";
/** Updater for inner content of a container element */
export declare class DOMContainerUpdater {
    constructor(element: HTMLElement, separator?: UIStyle.SeparatorOptions);
    /** Set flag to add components synchronously or asynchronously */
    setAsyncCreate(makeAsync?: boolean): void;
    /** Set animated transition duration in ms */
    setAnimationTimeMs(duration: number): void;
    /** Set animated transition velocity in screens per second */
    setAnimationSpeed(speed: number): void;
    /** Stop asynchronous component updates from being handled by this updater */
    stop(): void;
    /** Container element (read-only) */
    readonly element: HTMLElement;
    /** List separator options (read-only) */
    readonly separator?: UIStyle.SeparatorOptions;
    update(renderable: Iterable<UIRenderable>): void;
    /** Create a separator element */
    private _makeSeparator;
    /** Render a child object and add its DOM element as a child of the container element */
    private _addChildComponent;
    /** Returns an empty placeholder for given component */
    private _getPlaceholder;
    /** Animate elements based on their stored (old) position */
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
