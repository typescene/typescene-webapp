import { onPropertyChange, UIRenderEvent, UISpacer } from "typescene";
import { applyElementCSS } from "../DOMStyle";
import { RendererBase } from "./RendererBase";

class UISpacerRenderer extends RendererBase<UISpacer, HTMLElement> {
    constructor(public component: UISpacer) {
        super(component);
    }

    /** Create output element, used by base class */
    protected createElement() {
        let element = document.createElement("spacer");
        applyElementCSS(this.component, element, true);
        return element;
    }

    /** Handle render event */
    onUIRender(e: UIRenderEvent<UISpacer>) {
        this.handleRenderEvent(e);
    }

    /** Handle style changes */
    @onPropertyChange("hidden", "style", "shrinkwrap", "controlStyle", "dimensions")
    async updateStyleAsync() {
        let element = this.getElement();
        if (element) applyElementCSS(this.component, element);
    }
}

UISpacer.observe(UISpacerRenderer);
