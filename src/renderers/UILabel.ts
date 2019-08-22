import {
  logUnhandledException,
  onPropertyChange,
  Stringable,
  UIFocusRequestEvent,
  UILabel,
  UIRenderEvent,
  UITheme,
} from "typescene";
import { applyElementCSS, getCSSLength } from "../DOMStyle";
import { RendererBase } from "./RendererBase";

class UILabelRenderer extends RendererBase<UILabel, HTMLElement> {
  constructor(public component: UILabel) {
    super(component);
    this.DOM_CONTROL_EMIT = this.DOM_EMIT;
  }

  /** Create output element, used by base class */
  protected createElement() {
    let element = document.createElement(
      this.component.headingLevel ? "h" + this.component.headingLevel : "span"
    );
    if (this.component.isKeyboardFocusable()) element.tabIndex = 0;
    else if (this.component.isFocusable()) element.tabIndex = -1;
    applyElementCSS(this.component, element, true);
    setTextOrHtmlContent(element, {
      text: this.component.text,
      htmlFormat: this.component.htmlFormat,
      icon: this.component.icon,
      iconColor: this.component.iconColor || this.component.textStyle.color,
      iconSize: this.component.iconSize,
      iconMargin: this.component.iconMargin,
      iconAfter: this.component.iconAfter,
    });
    return element;
  }

  /** Handle render event */
  onUIRender(e: UIRenderEvent<UILabel>) {
    this.handleRenderEvent(e);
  }

  /** Handle focus requests */
  onUIFocusRequestAsync(e: UIFocusRequestEvent<UILabel>) {
    this.handleFocusRequestEvent(e);
  }

  /** Handle content changes */
  @onPropertyChange(
    "text",
    "htmlFormat",
    "icon",
    "iconColor",
    "iconSize",
    "iconMargin",
    "iconAfter"
  )
  setText() {
    let element = this.getElement();
    if (element) {
      setTextOrHtmlContent(element, {
        text: this.component.text,
        htmlFormat: this.component.htmlFormat,
        icon: this.component.icon,
        iconColor: this.component.iconColor || this.component.textStyle.color,
        iconSize: this.component.iconSize,
        iconMargin: this.component.iconMargin,
        iconAfter: this.component.iconAfter,
      });
    }
  }

  /** Handle heading level changes (update element) */
  onHeadingLevelChange() {
    if (this.isRendered()) {
      this.updateElement(this.createElement());
    }
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

/** Helper function to set the (text or html) content for given element */
export function setTextOrHtmlContent(element: HTMLElement, content: TextContentProperties) {
  let text = content.text == null ? "" : String(content.text);
  if (!content.icon) {
    // just set text/html content
    if (content.htmlFormat) element.innerHTML = text;
    else element.textContent = text;
    return;
  }

  // use a wrapper to contain both the icon and the text
  let contentWrapper = document.createElement("span");
  contentWrapper.style.display = "flex";
  contentWrapper.style.flexDirection = "row";
  contentWrapper.style.alignItems = "center";
  contentWrapper.style.justifyContent = "space-around";
  contentWrapper.style.textOverflow = "inherit";
  try {
    // add icon element
    let size = getCSSLength(content.iconSize, "1rem");
    let color = content.iconColor ? UITheme.replaceColor(content.iconColor) : "";
    let temp = document.createElement("div");
    temp.innerHTML = UITheme.current.icons[content.icon] || content.icon;
    let icon = temp.firstChild;
    if (!icon) icon = document.createTextNode("");
    if (String(icon.nodeName).toLowerCase() === "svg") {
      let iconElement: HTMLElement = icon as HTMLElement;
      if (iconElement.hasAttribute("stroke")) {
        iconElement.style.stroke = color || "currentColor";
      } else {
        iconElement.style.fill = color || "currentColor";
      }
      iconElement.style.display = "inline-block";
      iconElement.style.width = size;
      iconElement.style.height = "auto";
    } else {
      let iconWrapper = document.createElement("icon");
      iconWrapper.style.display = "inline-block";
      iconWrapper.appendChild(icon);
      icon = iconWrapper;
      if (content.iconSize) iconWrapper.style.fontSize = size;
      if (color) iconWrapper.style.color = color;
    }
    let iconSize = getCSSLength(content.iconSize, "1rem");
    (icon as HTMLElement).style.flex = "0 0 " + iconSize;
    (icon as HTMLElement).style.width = iconSize;
    (icon as HTMLElement).style.order = content.iconAfter ? "2" : "0";
    contentWrapper.appendChild(icon);
  } catch (err) {
    if (!_failedIconNotified[content.icon]) {
      _failedIconNotified[content.icon] = true;
      logUnhandledException(err);
    }
  }
  if (text) {
    // add margin element
    let margin = getCSSLength(content.iconMargin, ".5rem");
    let marginWrapper = document.createElement("span");
    marginWrapper.style.flex = "0 0 " + margin;
    marginWrapper.style.width = margin;
    marginWrapper.style.order = "1";
    contentWrapper.appendChild(marginWrapper);

    // add text element
    let textWrapper = document.createElement("span");
    textWrapper.style.flex = "1 0 0";
    textWrapper.style.order = content.iconAfter ? "0" : "2";
    textWrapper.style.textOverflow = "inherit";
    textWrapper.style.overflow = "hidden";
    if (content.htmlFormat) textWrapper.innerHTML = text;
    else textWrapper.textContent = text;
    contentWrapper.appendChild(textWrapper);

    // align icon to the left (ltr) if there is text next to it
    contentWrapper.style.justifyContent = "start";
  }
  element.innerHTML = "";
  element.appendChild(contentWrapper);
}
let _failedIconNotified: { [name: string]: true } = {};

interface TextContentProperties {
  text?: Stringable;
  htmlFormat?: boolean;
  icon?: string;
  iconSize?: string | number;
  iconMargin?: string | number;
  iconColor?: Stringable;
  iconAfter?: boolean;
}

UILabel.observe(UILabelRenderer);
