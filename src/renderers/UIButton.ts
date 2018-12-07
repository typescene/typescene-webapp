import { onPropertyChange, UIButton, UIFocusRequestEvent, UIRenderEvent } from "typescene";
import { applyElementCSS } from "../DOMStyle";
import { baseEventNames, controlEventNames, RendererBase } from "./RendererBase";
import { setTextOrHtmlContent } from "./UILabel";

class UIButtonRenderer extends RendererBase<UIButton, HTMLButtonElement> {
    constructor(public component: UIButton) {
        super(component);
    }

    /** Create output element, used by base class */
    protected createElement() {
        let element = document.createElement("button");
        element.tabIndex = this.component.isKeyboardFocusable() ? 0 : -1;
        applyElementCSS(this.component, element, true);
        setTextOrHtmlContent(element, {
            text: this.component.label,
            icon: this.component.icon,
            iconColor: this.component.iconColor,
            iconSize: this.component.iconSize,
            iconMargin: this.component.iconMargin,
            iconAfter: this.component.iconAfter
        });
        if (this.component.disabled) element.disabled = true;
        return element;
    }

    /** Called after rendering: add event handlers */
    protected afterRender() {
        this.propagateDOMEvents(baseEventNames);
        this.propagateDOMEvents(controlEventNames);
        super.afterRender();
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
    @onPropertyChange("label",
        "icon", "iconColor", "iconSize", "iconMargin", "iconAfter")
    setText() {
        let element = this.getElement();
        if (element) {
            setTextOrHtmlContent(element, {
                text: this.component.label,
                icon: this.component.icon,
                iconColor: this.component.iconColor,
                iconSize: this.component.iconSize,
                iconMargin: this.component.iconMargin,
                iconAfter: this.component.iconAfter
            });
        }
    }

    /** Handle disabled state */
    onDisabledChange() {
        let element = this.getElement();
        if (element) element.disabled = !!this.component.disabled;
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
    @onPropertyChange("hidden", "style", "shrinkwrap",
        "textStyle", "controlStyle", "dimensions")
    async updateStyleAsync() {
        let element = this.getElement();
        if (element) applyElementCSS(this.component, element);
    }
}

UIButton.observe(UIButtonRenderer);
