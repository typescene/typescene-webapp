import { tl, UICell, UIColumn, UIFlowCell, UIHeading1, UIOppositeRow, UIOutlineButton, UIScrollContainer } from "typescene";
import { HMR } from "../src/HMR";

// Enable Hot Module Reloading for the view exported by this module:
declare const module: any;
HMR.enableViewReload(module);

export default UICell.with(
    {
        background: "@text/20%",
        dimensions: { maxWidth: "100%", shrink: 1 }
    },
    UIFlowCell.with(
        {
            background: "@primary",
            textColor: "@primary:text",
            layout: { axis: "horizontal", distribution: "fill" },
            dimensions: { height: 48 },
            padding: { x: 16 },
            dropShadow: .3
        },
        UIHeading1.with({
            icon: "layout",
            text: "Sample",
            textStyle: { fontSize: 18 },
            position: { gravity: "center" }
        })
    ),
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
