import { UICell, UICloseRow, UIOutlineButton, UISelectionController, UIStyle } from "typescene";
import { setGlobalCSS } from "../DOMStyle";

setGlobalCSS({
    ".SelectionGroupButton:not(:first-child):not(#moreSpecific)": {
        marginLeft: "-1px",
        borderTopLeftRadius: "0",
        borderBottomLeftRadius: "0"
    },
    ".SelectionGroupButton:not(:last-child):not(#moreSpecific)": {
        borderTopRightRadius: "0",
        borderBottomRightRadius: "0"
    }
})

/** A button with predefined styles for use within a selection group */
export const SelectionGroupButton = UIOutlineButton.with({
    onClick: "+Select",
    shrinkwrap: false,
    style: UIStyle
        .create("SelectionGroupButton", {
            controlStyle: {
                background: "transparent",
                cssClassNames: ["SelectionGroupButton"]
            },
            position: { gravity: "stretch" }
        })
        .addState("selected", {
            textStyle: { color: "@primary:text" },
            controlStyle: {
                background: "@primary"
            }
        }),
    onArrowLeftKeyPress() { this.requestFocusPrevious() },
    onArrowRightKeyPress() { this.requestFocusNext() }
});

/** A button selection bar, to be populated with `SelectionGroupButton` */
export class ButtonSelector extends UICell {
    static preset(presets: UICell.Presets,
        ...content: Array<typeof SelectionGroupButton>) {
        return super.preset({
            style: UIStyle.create("TabBar", {
                position: { gravity: "stretch" },
                dimensions: { grow: 1, shrink: 1 },
                containerLayout: { axis: "horizontal", distribution: "fill", clip: true }
            }),
            ...presets
        }, UISelectionController.with(
            UICloseRow.with(
                {
                    dimensions: { grow: 1, shrink: 1 }
                },
                ...content
            )
        ));
    }
}
