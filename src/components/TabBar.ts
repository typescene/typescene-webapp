import { UIBorderlessButton, UICell, UIComponentEvent, UIRenderableConstructor, UIScrollContainer, UISelectionController, UIStyle } from "typescene";

/** A button with predefined styles for use within a tab bar */
export const TabBarButton = UIBorderlessButton.with({
    onClick: "+Select",
    style: UIStyle
        .create("TabBarButton", {
            position: { gravity: "end" },
            dimensions: { height: 42, maxHeight: 42, minWidth: 32, shrink: 0 },
            textStyle: { align: "start", color: "@text" },
            controlStyle: {
                borderRadius: 0,
                background: "transparent",
                css: {
                    borderLeft: "0",
                    borderRight: "0",
                    transition: "all .2s ease-in-out"
                }
            }
        })
        .addState("focused", {
            controlStyle: { background: "@background^-5%", dropShadow: .1 }
        })
        .addState("selected", {
            textStyle: { color: "@primary" },
            controlStyle: {
                border: "2px solid @primary",
                css: { borderLeft: "0", borderRight: "0", borderTopColor: "transparent" }
            }
        }),
    onArrowLeftKeyPress() { this.requestFocusPrevious() },
    onArrowRightKeyPress() { this.requestFocusNext() }
});

/** A bar containing tabs, for use with `TabBarButton` */
export class TabBar extends UICell {
    static preset(presets: UICell.Presets, ...content: Array<UIRenderableConstructor>) {
        return super.preset({
            style: UIStyle.create("TabBar", {
                position: { gravity: "stretch" },
                containerLayout: { axis: "horizontal", distribution: "start" }
            }),
            background: "@background",
            borderColor: "@primary",
            borderStyle: "solid",
            borderThickness: "0 0 .0625rem 0",
            ...presets
        }, UISelectionController.with(
            UIScrollContainer.with(
                {
                    layout: { axis: "horizontal", distribution: "start" },
                    horizontalScrollEnabled: true
                },
                ...content
            )
        ));
    }

    /** Index of last selected tab, if any (read-only) */
    selectedIndex?: number;
}
TabBar.handle({
    Select(e) {
        // update `selectedIndex` if possible
        if ((e instanceof UIComponentEvent) &&
            (e.source instanceof TabBarButton)) {
            let buttonParent = e.source.getParentComponent();
            if (buttonParent instanceof UIScrollContainer) {
                let selectedIndex = buttonParent.content.indexOf(e.source);
                this.selectedIndex = selectedIndex >= 0 ? selectedIndex : undefined;
            }
        }
    }
})
