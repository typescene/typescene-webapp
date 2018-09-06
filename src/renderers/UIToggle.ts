import { observe, onPropertyChange, UIFocusRequestEvent, UIRenderEvent, UITheme, UIToggle } from "typescene";
import { applyElementCSS } from "../DOMStyle";
import { baseEventNames, controlEventNames, RendererBase } from "./RendererBase";

@observe(UIToggle)
class UIToggleRenderer extends RendererBase<UIToggle, HTMLElement> {
    constructor(public component: UIToggle) {
        super(component);
    }

    /** Create output element, used by base class */
    protected createElement() {
        let element = document.createElement("span");
        let checkbox = document.createElement("input");
        checkbox.tabIndex = this.component.isKeyboardFocusable() ? 0 : -1;
        checkbox.type = "checkbox";
        checkbox.checked = !!this.component.state;
        checkbox.id = "UIToggle::" + this.component.managedId;
        checkbox.name = this.component.name || "UIToggle::" + this.component.managedId;
        if (this.component.disabled) checkbox.disabled = true;
        let label = document.createElement("label");
        label.htmlFor = "UIToggle::" + this.component.managedId;
        this._setLabelContent(label);
        element.appendChild(checkbox);
        element.appendChild(label);
        applyElementCSS(this.component, element, true);
        return element;
    }

    /** Called when emitting a UI event: update component value first */
    emitComponentEvent(e: Event) {
        let element = this.getElement();
        if (element) {
            let checkbox: HTMLInputElement = element.firstChild! as any;
            this.component.state = !!checkbox.checked;
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
    onUIRender(e: UIRenderEvent<UIToggle>) {
        this.handleRenderEvent(e);
    }

    /** Handle focus requests */
    onUIFocusRequestAsync(e: UIFocusRequestEvent<UIToggle>) {
        this.handleFocusRequestEvent(e);
    }

    /** Handle control changes */
    @onPropertyChange("name", "state")
    updateControl() {
        let element = this.getElement();
        if (element) {
            let checkbox: HTMLInputElement = element.firstChild! as any;
            if (this.component.name) checkbox.name = this.component.name;
            if (checkbox.checked && !this.component.state) {
                checkbox.checked = false;
            }
            else if (!checkbox.checked && this.component.state) {
                checkbox.checked = true;
            }
        }
    }

    /** Recreate element if label changes */
    onLabelChange() {
        let element = this.getElement();
        if (element) this._setLabelContent(element.lastChild as HTMLLabelElement);
    }

    /** Handle disabled state */
    onDisabledChange() {
        let element = this.getElement();
        if (element) (element.firstChild as any).disabled = !!this.component.disabled;
    }

    /** Populate the label element with a custom control and current label text */
    private _setLabelContent(label: HTMLLabelElement) {
        label.innerHTML = "";
        let customcontrol = document.createElement("control");
        if (this.component.highlightColor) {
            customcontrol.style.background = UITheme.replaceColor(this.component.highlightColor);
        }
        label.textContent = this.component.label ? "  " + this.component.label : "";
        label.insertBefore(customcontrol, label.firstChild);
    }

    /** Handle style changes */
    @onPropertyChange("hidden", "style", "shrinkwrap", "disabled",
        "textStyle", "controlStyle", "dimensions", "hightlightColor")
    async updateStyleAsync() {
        let element = this.getElement();
        if (element) {
            applyElementCSS(this.component, element);
            let customcontrol: HTMLElement = element.firstChild!.nextSibling as any;
            if (this.component.highlightColor) {
                customcontrol.style.background = UITheme.replaceColor(this.component.highlightColor);
            }
        }
    }
}
