import { observe, onPropertyChange, UICell } from "typescene";
import { applyElementCSS } from "../DOMStyle";

@observe(UICell)
class UICellRenderer {
    constructor(public component: UICell) { }

    /** Handle additional cell style changes */
    @onPropertyChange("css", "background", "textColor",
        "borderWidth", "borderColor", "borderStyle", "borderRadius",
        "dropShadow")
    async updateStyleAsync() {
        if (this.component.lastRenderOutput) {
            applyElementCSS(this.component,
                this.component.lastRenderOutput.element);
        }
    }
}
