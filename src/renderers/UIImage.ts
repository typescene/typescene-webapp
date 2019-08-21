import {
  onPropertyChange,
  UIComponentEvent,
  UIFocusRequestEvent,
  UIImage,
  UIRenderEvent,
} from "typescene";
import { applyElementCSS } from "../DOMStyle";
import { baseEventNames, controlEventNames, RendererBase } from "./RendererBase";

class UIImageRenderer extends RendererBase<UIImage, HTMLImageElement> {
  constructor(public component: UIImage) {
    super(component);
  }

  /** Create output element, used by base class */
  protected createElement() {
    let element = document.createElement("img");
    element.onerror = e => {
      this.component.emit(new UIComponentEvent("LoadError", this.component, undefined, e));
    };
    if (this.component.isKeyboardFocusable()) element.tabIndex = 0;
    else if (this.component.isFocusable()) element.tabIndex = -1;
    applyElementCSS(this.component, element, true);
    element.src = this.component.url || "";
    return element;
  }

  /** Called after rendering: add event handlers */
  protected afterRender() {
    this.propagateDOMEvents(baseEventNames);
    this.propagateDOMEvents(controlEventNames);
    super.afterRender();
  }

  /** Handle render event */
  onUIRender(e: UIRenderEvent<UIImage>) {
    this.handleRenderEvent(e);
  }

  /** Handle focus requests */
  onUIFocusRequestAsync(e: UIFocusRequestEvent<UIImage>) {
    this.handleFocusRequestEvent(e);
  }

  /** Handle URL change */
  onUrlChange() {
    let element = this.getElement();
    if (element) element.src = this.component.url || "";
  }

  /** Handle style changes */
  @onPropertyChange(
    "hidden",
    "style",
    "shrinkwrap",
    "disabled",
    "textStyle",
    "controlStyle",
    "dimensions"
  )
  async updateStyleAsync() {
    let element = this.getElement();
    if (element) applyElementCSS(this.component, element);
  }
}

UIImage.observe(UIImageRenderer);
