import { tl, UICell, UIColumn, UIFlowCell, UIOppositeRow, UIOutlineButton, UIScrollContainer } from "typescene";
import { TopNavBar } from "../src";
import { HMR } from "../src/HMR";

// Enable Hot Module Reloading for the view exported by this module:
declare const module: any;
HMR.enableViewReload(module);

export default UICell.with(
    {
        background: "#eee",
        dimensions: { maxWidth: "100%", shrink: 1 }
    },
    TopNavBar.with({
        title: "Sample",
        icon: "layout",
    }),
    UIScrollContainer.with(
        UIFlowCell.with(
            {
                position: { gravity: "center" },
                dimensions: { width: 480, maxWidth: "95%" },
                background: "@background",
                padding: 24,
                margin: { y: 32 },
                borderRadius: 4
            },
            UIColumn.with(
                { spacing: 16 },
                tl("{h1}Sample page"),
                tl("{p}${text}!"),
                UIOppositeRow.with(
                    UIOutlineButton.withLabel("Foo...", "foo()")
                )
            )
        )
    )
)
