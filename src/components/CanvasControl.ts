import { onPropertyChange, UIControl, UIFocusRequestEvent, UIRenderEvent, UITheme } from "typescene";
import { applyElementCSS } from "../DOMStyle";
import { baseEventNames, controlEventNames, RendererBase } from "../renderers/RendererBase";

/**
 * Encapsulates an HTML Canvas element, and provides access to its 2D rendering context.
 * @note The `dimensions` property must contain width and height values defined in absolute units for the canvas itself to be sized and scaled correctly (using `window.devicePixelRatio`).
 */
export class CanvasControl extends UIControl {
    /** The 2D canvas rendering context provided by the browser */
    get canvasRenderingContext() {
        if (!this._context) {
            this._context = this._canvas.getContext("2d")!;
            let scale = window.devicePixelRatio || 1;
            this._context.setTransform(scale, 0, 0, scale, 0, 0);
        }
        return this._context;
    }

    style = UITheme.current.baseControlStyle;
    shrinkwrap = true;

    private _canvas = document.createElement("canvas");
    private _context!: CanvasRenderingContext2D;
}

class CanvasControlRenderer extends RendererBase<CanvasControl, HTMLCanvasElement> {
    constructor(public component: CanvasControl) {
        super(component);
    }

    /** Create output element, used by base class */
    protected createElement() {
        let ctx = this.component.canvasRenderingContext;
        let element = ctx.canvas;
        this._setCanvasSize();
        applyElementCSS(this.component, element);
        return element;
    }

    /** Called after rendering: add event handlers */
    protected afterRender() {
        this._setCanvasSize();
        this.propagateDOMEvents(baseEventNames);
        this.propagateDOMEvents(controlEventNames);
        super.afterRender();
    }

    /** Handle render event */
    onUIRender(e: UIRenderEvent<CanvasControl>) {
        this.handleRenderEvent(e);
    }

    /** Handle focus requests */
    onUIFocusRequestAsync(e: UIFocusRequestEvent<CanvasControl>) {
        this.handleFocusRequestEvent(e);
    }

    /** Handle style changes */
    @onPropertyChange("hidden", "style", "shrinkwrap", "disabled",
        "textStyle", "controlStyle")
    async updateStyleAsync(...bla: any[]) {
        let element = this.getElement();
        if (element) {
            applyElementCSS(this.component, element);
            this._setCanvasSize();
        }
    }

    /** Handle dimension changes synchronously */
    @onPropertyChange("dimensions")
    updateSize() {
        let element = this.getElement();
        if (element) {
            applyElementCSS(this.component, element);
            this._setCanvasSize();
        }
    }

    /** Resize canvas if needed */
    private _setCanvasSize() {
        let element = this.getElement();
        if (element) {
            // set dimensions directly if they are not set yet (will recurse)
            if (!this.component.dimensions.width ||
                !this.component.dimensions.height) {
                this.component.dimensions = {
                    ...this.component.dimensions,
                    width: element.clientWidth + "px",
                    height: element.clientHeight + "px"
                }
            }
            else {
                // determine new width/height and check if need to resize
                let scale = window.devicePixelRatio || 1;
                let width = element.clientWidth * scale;
                let height = element.clientHeight * scale;
                this.component.canvasRenderingContext.setTransform(scale, 0, 0, scale, 0, 0);
                if (element.height !== height ||
                    element.width !== width) {
                    // changing size will reset the canvas
                    // ... so blit the original image afterwards
                    let ctx = element.getContext("2d")!;
                    let oldWidth = element.width;
                    let oldHeight = element.height;
                    let img = ctx && ctx.getImageData(0, 0, oldWidth, oldHeight);
                    element.height = height;
                    element.width = width;
                    this.component.canvasRenderingContext.setTransform(scale, 0, 0, scale, 0, 0);
                    img && ctx.putImageData(img, 0, 0, 0, 0, oldWidth, oldHeight);
                }
            }
        }
    }
}

CanvasControl.observe(CanvasControlRenderer);
