import { UIStyle, UITheme } from "typescene";
import { AlertDialogBuilder, DropdownMenuBuilder } from "./components";
export declare class BrowserTheme extends UITheme {
    constructor();
    baseControlStyle: UIStyle;
    ConfirmationDialogBuilder: typeof AlertDialogBuilder;
    MenuBuilder: typeof DropdownMenuBuilder;
    colors: UITheme["colors"];
    icons: UITheme["icons"];
    setFocusOutline(width?: string | number, blur?: string | number, color?: string): this;
}
