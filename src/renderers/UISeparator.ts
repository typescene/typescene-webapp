import { onPropertyChange, UIRenderEvent, UISeparator } from "typescene";
import { applyElementCSS, getCSSLength } from "../DOMStyle";
import { baseEventNames, RendererBase } from "./RendererBase";

class UISeparatorRenderer extends RendererBase<UISeparator, HTMLElement> {
    constructor(public component: UISeparator) {
        super(component);
    }

    /** Create output element, used by base class */
    protected createElement() {
        let element = document.createElement("hr");
        applyElementCSS(this.component, element, true, "UIRender__Separator--line" +
            (this.component.vertical ? " UIRender__Separator--line-vertical" : ""));
        if (this.component.margin) {
            let margin = getCSSLength(this.component.margin);
            element.style.margin = this.component.vertical ? ("0 " + margin) : (margin + " 0");
        }
        return element;
    }

    /** Called after rendering: add event handlers */
    protected afterRender() {
        this.propagateDOMEvents(baseEventNames);
        super.afterRender();
    }

    /** Handle render event */
    onUIRender(e: UIRenderEvent<UISeparator>) {
        this.handleRenderEvent(e);
    }

    /** Handle style changes */
    @onPropertyChange("hidden", "style", "vertical", "dimensions", "color", "thickness", "margin")
    async updateStyleAsync() {
        let element = this.getElement();
        if (element) {
            applyElementCSS(this.component, element, false, "UIRender__Separator--line" +
                (this.component.vertical ? " UIRender__Separator--line-vertical" : ""));
            if (this.component.margin) {
                let margin = getCSSLength(this.component.margin);
                element.style.margin = this.component.vertical ? ("0 " + margin) : (margin + " 0");
            }
        }
    }
}

UISeparator.observe(UISeparatorRenderer);
