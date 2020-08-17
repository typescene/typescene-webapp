import { onPropertyChange, UIButton, UIFocusRequestEvent, UIRenderEvent } from "typescene";
import { BrowserApplication, BrowserHashActivationContext } from "../BrowserApplication";
import { applyElementCSS } from "../DOMStyle";
import { RendererBase } from "./RendererBase";
import { setTextOrHtmlContent } from "./UILabel";

class UIButtonRenderer extends RendererBase<
  UIButton,
  HTMLButtonElement | HTMLAnchorElement
> {
  constructor(public component: UIButton) {
    super(component);
    this.DOM_CONTROL_EMIT = this.DOM_EMIT;
  }

  /** Create output element, used by base class */
  protected createElement() {
    let element = document.createElement(
      this.component.accessibleRole === "link" ? "a" : "button"
    );
    element.tabIndex = this.component.isKeyboardFocusable() ? 0 : -1;
    applyElementCSS(this.component, element, true);
    setTextOrHtmlContent(element, {
      text: this.component.label,
      icon: this.component.icon,
      iconColor: this.component.iconColor,
      iconSize: this.component.iconSize,
      iconMargin: this.component.iconMargin,
      iconAfter: this.component.iconAfter,
    });
    if (this.component.navigateTo) {
      (element as HTMLAnchorElement).href = getPathHref(
        this.component,
        this.component.navigateTo
      );
    }
    if (this.component.disabled) {
      element.setAttribute("disabled", "disabled");
    }

    // handle direct clicks with `navigateTo` set
    element.addEventListener("click", e => {
      if (this.component.navigateTo) {
        if (
          (e as MouseEvent).ctrlKey ||
          (e as MouseEvent).altKey ||
          (e as MouseEvent).metaKey
        ) {
          // assume OS handles key combo clicks,
          // don't treat as a click at all:
          e.stopPropagation();
          e.stopImmediatePropagation();
        } else {
          // use app to navigate instead
          e.preventDefault();
          if (!this.component.disabled) {
            let app = this.component.getParentComponent(BrowserApplication);
            app && app.navigate(this.component.navigateTo);
          }
        }
      }
    });
    return element;
  }

  /** Handle render event */
  onUIRender(e: UIRenderEvent<UIButton>) {
    this.handleRenderEvent(e);
  }

  /** Handle focus requests */
  onUIFocusRequestAsync(e: UIFocusRequestEvent<UIButton>) {
    this.handleFocusRequestEvent(e);
  }

  /** Handle content changes */
  @onPropertyChange("label", "icon", "iconColor", "iconSize", "iconMargin", "iconAfter")
  setText() {
    let element = this.getElement();
    if (element) {
      setTextOrHtmlContent(element, {
        text: this.component.label,
        icon: this.component.icon,
        iconColor: this.component.iconColor,
        iconSize: this.component.iconSize,
        iconMargin: this.component.iconMargin,
        iconAfter: this.component.iconAfter,
      });
    }
  }

  /** Handle link `href` changes */
  onNavigateToChange() {
    let element = this.getElement();
    if (element) {
      (element as HTMLAnchorElement).href = getPathHref(
        this.component,
        this.component.navigateTo
      );
    }
  }

  /** Handle disabled state */
  onDisabledChange() {
    let element = this.getElement();
    if (element) {
      if (this.component.disabled) {
        element.setAttribute("disabled", "disabled");
      } else {
        element.removeAttribute("disabled");
      }
    }
  }

  /** Handle selection */
  onSelect() {
    let element = this.getElement();
    if (element) element.dataset.selected = "selected";
  }

  /** Handle deselection */
  onDeselect() {
    let element = this.getElement();
    if (element) delete element.dataset.selected;
  }

  /** Handle style changes */
  @onPropertyChange(
    "hidden",
    "style",
    "shrinkwrap",
    "textStyle",
    "decoration",
    "dimensions",
    "position"
  )
  updateStyleAsync() {
    let element = this.getElement();
    if (element) applyElementCSS(this.component, element);
  }
}

UIButton.addObserver(UIButtonRenderer);

/** Helper function to get a proper `href` attribute for given path */
function getPathHref(component: UIButton, path?: string) {
  let app = component.getParentComponent(BrowserApplication);
  let ctx = app && (app.activationContext as BrowserHashActivationContext);
  return (ctx && ctx.getPathHref && ctx.getPathHref(path)) || "";
}
