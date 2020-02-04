import { onPropertyChange, UICell } from "typescene";
import { applyElementCSS } from "../DOMStyle";

class UICellRenderer {
  constructor(public component: UICell) {}

  /** Handle additional cell style changes */
  @onPropertyChange(
    "css",
    "background",
    "textColor",
    "borderThickness",
    "borderColor",
    "borderStyle",
    "borderRadius",
    "dropShadow",
    "opacity"
  )
  async updateStyleAsync() {
    if (this.component.lastRenderOutput) {
      applyElementCSS(this.component, this.component.lastRenderOutput.element);
    }
  }
}

UICell.observe(UICellRenderer);
