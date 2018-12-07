import { onPropertyChange, UIFocusRequestEvent, UIRenderEvent, UITextField } from "typescene";
import { applyElementCSS } from "../DOMStyle";
import { baseEventNames, controlEventNames, RendererBase } from "./RendererBase";

class UITextFieldRenderer extends RendererBase<UITextField, HTMLInputElement | HTMLTextAreaElement> {
    constructor(public component: UITextField) {
        super(component);
    }

    /** Create output element, used by base class */
    protected createElement() {
        let element = document.createElement(this.component.multiline ? "textarea" : "input");
        element.tabIndex = this.component.isKeyboardFocusable() ? 0 : -1;
        applyElementCSS(this.component, element, true);
        element.placeholder = this.component.placeholder || " ";  // layout workaround
        element.value = this.component.value || "";
        if (this.component.name) element.name = this.component.name;
        if (this.component.disabled) element.disabled = true;
        return element;
    }

    /** Called when emitting a UI event: update component value first */
    emitComponentEvent(e: Event) {
        let element = this.getElement();
        if (element) {
            this.component.value = element.value;
        }
        super.emitComponentEvent(e);
    }

    /** Called after rendering: add event handlers */
    protected afterRender() {
        this.propagateDOMEvents(baseEventNames);
        this.propagateDOMEvents(controlEventNames);
        super.afterRender();
    }

    /** Handle render event */
    onUIRender(e: UIRenderEvent<UITextField>) {
        this.handleRenderEvent(e);
    }

    /** Handle focus requests */
    onUIFocusRequestAsync(e: UIFocusRequestEvent<UITextField>) {
        this.handleFocusRequestEvent(e);
    }

    /** Handle multiline/single line changes */
    onMultilineChange() {
        if (this.isRendered()) {
            this.updateElement(this.createElement());
        }
    }

    /** Handle control changes */
    @onPropertyChange("name", "value", "placeholder")
    updateControl() {
        let element = this.getElement();
        if (element) {
            let placeholder = this.component.placeholder || " ";
            if (element.placeholder !== placeholder) element.placeholder = placeholder;
            if (this.component.name) element.name = this.component.name;

            // update value asynchronously if it was set programmatically
            let value = this.component.value || "";
            if (element.value !== value) element!.value = value;
        }
    }

    /** Handle disabled state */
    onDisabledChange() {
        let element = this.getElement();
        if (element) element.disabled = !!this.component.disabled;
    }

    /** Handle style changes */
    @onPropertyChange("hidden", "style", "shrinkwrap",
        "textStyle", "controlStyle", "dimensions")
    async updateStyleAsync() {
        let element = this.getElement();
        if (element) applyElementCSS(this.component, element);
    }
}

UITextField.observe(UITextFieldRenderer);
