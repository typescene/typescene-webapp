import { UICell, UIMenuBuilder, UIStyle, UITransitionType } from "typescene";
declare const DropdownMenu_base: typeof UICell;
declare class DropdownMenu extends DropdownMenu_base {
    emitMenuItemSelectedEvent(key: string): void;
}
export declare class DropdownMenuBuilder extends UIMenuBuilder {
    static labelStyleMixin: Partial<UIStyle.TextStyle>;
    static hintStyleMixin: Partial<UIStyle.TextStyle>;
    clear(): this;
    addOption(key: string, text: string, icon?: string, hint?: string, hintIcon?: string, textStyle?: Partial<UIStyle.TextStyle>, hintStyle?: Partial<UIStyle.TextStyle>): this;
    addSelectionGroup(options: Array<{
        key: string;
        text: string;
    }>, selectedKey?: string, textStyle?: Partial<UIStyle.TextStyle>): this;
    addSeparator(): this;
    setGravity(gravity: "start" | "stretch" | "end"): this;
    setRevealTransition(transition: UITransitionType): this;
    setExitTransition(transition: UITransitionType): this;
    build(): typeof DropdownMenu;
    private readonly _items;
    private _gravity;
    private _revealTransition?;
    private _exitTransition?;
}
export {};
