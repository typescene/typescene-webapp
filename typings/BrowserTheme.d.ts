import { UIStyle, UITheme } from "typescene";
import { AlertDialogBuilder, DropdownMenuBuilder } from "./components";
/** Theme that includes default Web app specific styles */
export declare class BrowserTheme extends UITheme {
    constructor();
    /** Base control style, extended with default text style */
    baseControlStyle: UIStyle;
    /** Confirmation/alert dialog component builder */
    ConfirmationDialogBuilder: typeof AlertDialogBuilder;
    /** Dropdown menu component builder */
    MenuBuilder: typeof DropdownMenuBuilder;
    /** Expanded set of default colors */
    colors: UITheme["colors"];
    /** Default icons in SVG format (base implementation adapted from Material Design icons by Google) */
    icons: UITheme["icons"];
    /** Set the global focus 'glow' outline width and blur (dp or string with unit, defaults to 2 and 0), and color (defaults to `@primary/50%`) */
    setFocusOutline(width?: string | number, blur?: string | number, color?: string): this;
}
/** @internal Add primary global CSS classes */
export declare function initializeCSS(): void;
