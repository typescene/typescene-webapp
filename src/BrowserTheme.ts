import { UIStyle, UITheme } from "typescene";
import { AlertDialogBuilder, DropdownMenuBuilder } from "./components";
import { getCSSLength, setGlobalCSS } from "./DOMStyle";

/** Base text style mixed into the base control style set */
const _textStyle = UIStyle.create("text", {
    textStyle: {
        fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Oxygen-Sans, Ubuntu, \"Helvetica Neue\", Arial, sans-serif",
        fontSize: 14,
        fontWeight: "normal",
        lineHeight: "normal",
        italic: false,
        lineBreakMode: "pre"
    }
});

/** Theme that includes default Web app specific styles */
export class BrowserTheme extends UITheme {
    constructor() {
        super();
        this.addStyles(
            _textStyle,

            // simple control styles
            UIStyle.create("spacer", {
                dimensions: { grow: 1, width: 8, height: 8 },
                position: { gravity: "stretch" }
            }),
            UIStyle.create("separator", {
                dimensions: { grow: 0, shrink: 0 },
                position: { gravity: "stretch" }
            }),

            // label styles
            UIStyle.create("label", {
                dimensions: { maxWidth: "100%" },
                controlStyle: { css: { margin: "calc(1rem - .5em) 0" } },
                textStyle: { lineBreakMode: "ellipsis" }
            }),
            UIStyle.create("label_close", {
                controlStyle: { css: { margin: "0" } }
            }),
            UIStyle.create("heading1", {
                textStyle: { fontSize: 60, fontWeight: 200, letterSpacing: -.5 }
            }),
            UIStyle.create("heading2", {
                textStyle: { fontSize: 24 }
            }),
            UIStyle.create("heading3", {
                textStyle: { fontSize: 18, bold: true }
            }),
            UIStyle.create("paragraph", {
                textStyle: { lineBreakMode: "pre-wrap", lineHeight: 1.4 },
                controlStyle: { css: { cursor: "text" } }
            }),

            // button styles
            UIStyle.create("button", {
                dimensions: { minWidth: 96 },
                textStyle: {
                    color: "@primary",
                    align: "center",
                    lineBreakMode: "ellipsis"
                },
                controlStyle: {
                    border: "0",
                    background: "@controlBase",
                    borderRadius: 4,
                    css: {
                        padding: ".5rem .75rem",
                        cursor: "pointer",
                        transition: "all .2s ease"
                    }
                },
            }).addState("pressed", {
                textStyle: { color: "@primary:text" },
                controlStyle: { background: "@primary" }
            }).addState("hover", {
                textStyle: { color: "@primary:text" },
                controlStyle: { background: "@primary" }
            }).addState("disabled", {
                textStyle: { color: "@primary" },
                controlStyle: {
                    border: "0",
                    background: "@controlBase",
                    css: { opacity: ".5", cursor: "inherit" }
                },
            }),
            UIStyle.create("button_primary", {
                textStyle: { color: "@primary:text" },
                controlStyle: { background: "@primary", border: "1px solid @primary" }
            }).addState("hover", {
                controlStyle: {
                    background: "@primary^+30%",
                    border: "1px solid @primary^+30%"
                }
            }),
            UIStyle.create("button_borderless", {
                dimensions: { minWidth: 16, minHeight: 16 },
                controlStyle: {
                    background: "transparent",
                    border: "1px solid transparent",
                    css: { padding: ".4rem .7rem" }
                }
            }).addState("hover", {
                textStyle: { color: "@primary" },
                controlStyle: { background: "@controlStyle^-50%/30%" }
            }),
            UIStyle.create("button_outline", {
                controlStyle: { border: "1px solid @primary" }
            }),
            UIStyle.create("button_link", {
                dimensions: { minWidth: 16, minHeight: 16 },
                textStyle: { align: "start||left" },
                controlStyle: { background: "transparent" }
            }).addState("hover", {
                textStyle: { color: "@primary", underline: true },
                controlStyle: { background: "transparent" }
            }).addState("disabled", {
                textStyle: { color: "@primary" },
                controlStyle: { background: "transparent" },
            }),
            UIStyle.create("button_large", {
                dimensions: { minWidth: 128 },
                textStyle: { color: "@primary:text", fontWeight: 200, fontSize: 16 },
                controlStyle: {
                    background: "@primary",
                    borderRadius: 32,
                    css: { padding: ".75rem 1rem" }
                }
            }),
            UIStyle.create("button_small", {
                dimensions: { minWidth: 64 },
                textStyle: { color: "@controlBase:text", fontSize: 12 },
                controlStyle: {
                    border: "1px solid @controlBase^-20%",
                    css: { padding: ".25rem .5rem" }
                }
            }),
            UIStyle.create("button_icon", {
                dimensions: { minWidth: 32, minHeight: 32 },
                position: { gravity: "center" },
                controlStyle: {
                    background: "transparent",
                    borderRadius: "50%",
                    css: { padding: "0" }
                }
            }).addState("hover", {
                textStyle: { color: "@primary" },
                controlStyle: { background: "@controlStyle^-50%/30%" }
            }),

            // text field styles
            UIStyle.create("textfield", {
                textStyle: { color: "@white:text" },
                controlStyle: {
                    background: "@white",
                    border: "1px solid @controlBase^-20%",
                    borderRadius: 4,
                    css: { padding: ".5rem .5rem", cursor: "text" }
                }
            }),
            UIStyle.create("textfield_borderless", {
                controlStyle: {
                    background: "transparent",
                    border: "0",
                    borderRadius: "0",
                    css: { padding: "0" }
                }
            }).addState("focused", {
                controlStyle: { css: { boxShadow: "none" } }
            }),

            // toggle styles
            UIStyle.create("toggle", {
                textStyle: { color: "@text" },
                controlStyle: { cssClassNames: ["UI__CustomToggle"] }
            }),

            // image styles
            UIStyle.create("image", {
                position: { gravity: "center" }
            }),
        );
    }

    /** Base control style, extended with default text style */
    baseControlStyle: UIStyle = UIStyle.create("UIControl", {
        ...this.baseControlStyle.getStyles(),
        textStyle: _textStyle.getStyles().textStyle
    });

    /** Confirmation/alert dialog component builder */
    ConfirmationDialogBuilder = AlertDialogBuilder;

    /** Dropdown menu component builder */
    MenuBuilder = DropdownMenuBuilder;

    /** Expanded set of default colors */
    colors: UITheme["colors"] = {
        black: "#000000",
        darkerGray: "#333333",
        darkGray: "#777777",
        lightGray: "#dddddd",
        white: "#ffffff",
        slate: "#667788",
        lightSlate: "#c0c8d0",
        red: "#ee3333",
        orange: "#ee9922",
        yellow: "#ddcc33",
        lime: "#99bb33",
        green: "#44aa44",
        turquoise: "#33aaaa",
        cyan: "#33bbbb",
        blue: "#3355aa",
        violet: "#5533aa",
        purple: "#8833aa",
        magenta: "#dd4488",
        primary: "@blue",
        accent: "@purple",
        background: "@white",
        appBackground: "@background",
        text: "@background:text",
        controlBase: "@background",
        separator: "@background^-50%/20%",
        modalShade: "@black"
    }

    /** Default icons in SVG format (base implementation adapted from Material Design icons by Google) */
    icons: UITheme["icons"] = {
        blank: `<svg viewBox="0 0 48 48"></svg>`,
        close: `<svg viewBox="0 0 48 48"><path d="M38 12.83L35.17 10 24 21.17 12.83 10 10 12.83 21.17 24 10 35.17 12.83 38 24 26.83 35.17 38 38 35.17 26.83 24z"/></svg>`,
        expandDown: `<svg viewBox="0 0 48 48"><path d="M33.17 17.17L24 26.34l-9.17-9.17L12 20l12 12 12-12z"/></svg>`,
        menu: `<svg viewBox="0 0 48 48"><path d="M6 36h36v-4H6v4zm0-10h36v-4H6v4zm0-14v4h36v-4H6z"/></svg>`,
        check: `<svg viewBox="0 0 48 48"><path d="M18 32.34L9.66 24l-2.83 2.83L18 38l24-24-2.83-2.83z"/></svg>`
    }

    /** Set the global focus 'glow' outline width and blur (dp or string with unit, defaults to 2 and 0), and color (defaults to `@primary/50%`) */
    setFocusOutline(width: string | number = 2, blur: string | number = 0, color = "@primary/50%") {
        let boxShadow = "0 0 " + getCSSLength(blur) + " " +
            getCSSLength(width) + " " + UITheme.replaceColor(color);
        setGlobalCSS({
            ".UI[tabindex]:focus": { boxShadow },
            ".UI.ShowFocusWithin[tabindex]:focus-within": { boxShadow },
            ".UI>[tabindex]:focus+label>control": { boxShadow }
        });
        return this;
    }
}

/** @internal Add primary global CSS classes */
export function initializeCSS() {
    setGlobalCSS({
        // add UI component base styles
        ".UI": {
            margin: "0",
            padding: "0",
            border: "0",
            outline: "0",
            cursor: "inherit",
            boxSizing: "border-box",
            textOverflow: "ellipsis"
        },
        ".UI[hidden]": {
            display: "none"
        },
        ".UIContainer": {
            display: "flex",
            flex: "0 1 auto",
            background: "transparent",
            textAlign: "start||left"
        },

        // add style for fixed root component
        ".App__FixedRoot": {
            position: "fixed",
            top: "0", bottom: "0",
            left: "0", right: "0",
            display: "flex",
            flexDirection: "column",
            cursor: "default",
            overflow: "hidden"
        },

        // add modal wrapper/shader styles
        ".App__ModalShader": {
            zIndex: "1000",
            position: "fixed",
            top: "0", left: "0", bottom: "0", right: "0",
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            justifyContent: "stretch",
            alignContent: "stretch",
            transition: "background-color .2s ease-in-out",
            background: "transparent"
        },
        ".App__ModalWrapper": {
            flex: "1 0 auto",
            display: "flex"
        },
        ".App__ModalWrapper>.UI": {
            zIndex: "10000",
            overflow: "hidden"
        },

        // add separator styles
        ".UIRender__Separator--line": {
            flex: "0 0 auto",
            margin: "0",
            padding: "0",
            border: "0",
            borderTopStyle: "solid",
            borderWidth: "1px"
        },
        ".UIRender__Separator--line-vertical": {
            borderTopStyle: "none",
            borderLeftStyle: "solid",
            borderWidth: "1px"
        },
        ".UIRender__Separator--spacer": {
            flex: "0 1 auto", // flex-basis set inline
            alignSelf: "stretch"
        },

        // add custom toggle styles
        ".UI__CustomToggle": {
            lineHeight: "1.5rem",
            position: "relative",
            padding: ".25rem .5rem"
        },
        ".UI__CustomToggle>input": {
            position: "absolute",
            top: ".25rem", left: ".5rem",
            width: "1rem", height: "1rem",
            margin: "0", padding: "0", border: "0",
            opacity: "0"
        },
        ".UI__CustomToggle>input+label": {
            display: "inline-block",
            paddingLeft: "1.25rem"
        },
        ".UI__CustomToggle>input[disabled]+label": {
            opacity: ".5"
        },
        ".UI__CustomToggle>input:not([disabled])+label": {
            cursor: "pointer"
        },
        ".UI__CustomToggle>input+label>control": {
            content: "''",
            position: "absolute",
            top: ".25rem", left: ".5rem", 
            width: ".875rem",
            height: ".875rem",
            background: "#fff",
            border: "1px solid #aaa",
            borderRadius: ".25rem"
        },
        ".UI__CustomToggle>input:checked+label>control": {
            borderColor: "#666",
            background: "#666"
        },
        ".UI__CustomToggle>input:checked+label>control::after": {
            content: "''",
            boxSizing: "border-box",
            display: "block",
            position: "absolute",
            top: "0", left: ".25rem",
            height: ".75rem",
            width: ".375rem",
            transform: "rotate(45deg)",
            borderBottom: ".125rem solid #fff",
            borderRight: ".125rem solid #fff"
        },

        // transition: fade
        "[data-transition-reveal=fade][data-transition-t=revealing]": {
            opacity: 0
        },
        "[data-transition-reveal=fade][data-transition-t=revealed]": {
            opacity: 1,
            transition: "opacity .5s ease-in-out"
        },
        "[data-transition-exit=fade][data-transition-t=exiting]": {
            opacity: 0,
            transition: "opacity .5s ease-in-out"
        },

        // transition: fade-fast
        "[data-transition-reveal=fade-fast][data-transition-t=revealing]": {
            opacity: 0
        },
        "[data-transition-reveal=fade-fast][data-transition-t=revealed]": {
            opacity: 1,
            transition: "opacity .2s ease-in-out"
        },
        "[data-transition-exit=fade-fast][data-transition-t=exiting]": {
            opacity: 0,
            transition: "opacity .2s ease-in-out"
        },

        // transition: down
        "[data-transition-reveal=down][data-transition-t=revealing]": {
            opacity: 0,
            transform: "translateY(-50%)"
        },
        "[data-transition-reveal=down][data-transition-t=revealed]": {
            opacity: 1,
            tranform: "",
            transition: "opacity .5s ease-in-out, transform .5s ease"
        },
        "[data-transition-exit=down][data-transition-t=exiting]": {
            opacity: 0,
            transform: "translateY(50%)",
            transition: "opacity .5s ease-in-out, transform .5s ease"
        },

        // transition: down-fast
        "[data-transition-reveal=down-fast][data-transition-t=revealing]": {
            opacity: 0,
            transform: "translateY(-50%)"
        },
        "[data-transition-reveal=down-fast][data-transition-t=revealed]": {
            opacity: 1,
            tranform: "",
            transition: "opacity .2s ease-in-out, transform .15s ease"
        },
        "[data-transition-exit=down-fast][data-transition-t=exiting]": {
            opacity: 0,
            transform: "translateY(50%)",
            transition: "opacity .2s ease-in-out, transform .15s ease"
        },

        // transition: up
        "[data-transition-reveal=up][data-transition-t=revealing]": {
            opacity: 0,
            transform: "translateY(50%)"
        },
        "[data-transition-reveal=up][data-transition-t=revealed]": {
            opacity: 1,
            tranform: "",
            transition: "opacity .5s ease-in-out, transform .5s ease"
        },
        "[data-transition-exit=up][data-transition-t=exiting]": {
            opacity: 0,
            transform: "translateY(-50%)",
            transition: "opacity .5s ease-in-out, transform .5s ease"
        },

        // transition: up-fast
        "[data-transition-reveal=up-fast][data-transition-t=revealing]": {
            opacity: 0,
            transform: "translateY(50%)"
        },
        "[data-transition-reveal=up-fast][data-transition-t=revealed]": {
            opacity: 1,
            tranform: "",
            transition: "opacity .2s ease-in-out, transform .15s ease"
        },
        "[data-transition-exit=up-fast][data-transition-t=exiting]": {
            opacity: 0,
            transform: "translateY(-50%)",
            transition: "opacity .2s ease-in-out, transform .15s ease"
        },

        // transition: left
        "[data-transition-reveal=left][data-transition-t=revealing]": {
            opacity: 0,
            transform: "translateX(50%)"
        },
        "[data-transition-reveal=left][data-transition-t=revealed]": {
            opacity: 1,
            tranform: "",
            transition: "opacity .5s ease-in-out, transform .5s ease"
        },
        "[data-transition-exit=left][data-transition-t=exiting]": {
            opacity: 0,
            transform: "translateX(-50%)",
            transition: "opacity .5s ease-in-out, transform .5s ease"
        },

        // transition: left-fast
        "[data-transition-reveal=left-fast][data-transition-t=revealing]": {
            opacity: 0,
            transform: "translateX(50%)",
            willChange: "transform",
            position: "relative"
        },
        "[data-transition-reveal=left-fast][data-transition-t=revealed]": {
            opacity: 1,
            tranform: "",
            transition: "opacity .2s ease-in-out, transform .15s ease",
            position: "relative"
        },
        "[data-transition-exit=left-fast][data-transition-t=exiting]": {
            opacity: 0,
            transform: "translateX(-50%)",
            transition: "opacity .2s ease-in-out, transform .15s ease"
        },

        // transition: right
        "[data-transition-reveal=right][data-transition-t=revealing]": {
            opacity: 0,
            transform: "translateX(-50%)"
        },
        "[data-transition-reveal=right][data-transition-t=revealed]": {
            opacity: 1,
            tranform: "",
            transition: "opacity .5s ease-in-out, transform .5s ease"
        },
        "[data-transition-exit=right][data-transition-t=exiting]": {
            opacity: 0,
            transform: "translateX(50%)",
            transition: "opacity .5s ease-in-out, transform .5s ease"
        },

        // transition: right-fast
        "[data-transition-reveal=right-fast][data-transition-t=revealing]": {
            opacity: 0,
            transform: "translateX(-50%)"
        },
        "[data-transition-reveal=right-fast][data-transition-t=revealed]": {
            opacity: 1,
            tranform: "",
            transition: "opacity .2s ease-in-out, transform .15s ease"
        },
        "[data-transition-exit=right-fast][data-transition-t=exiting]": {
            opacity: 0,
            transform: "translateX(50%)",
            transition: "opacity .2s ease-in-out, transform .15s ease"
        }
    });
}
