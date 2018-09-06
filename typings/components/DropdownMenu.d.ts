import { UICell, UIMenuBuilder, UIStyle, UITransitionType } from "typescene";
declare const DropdownMenu_base: typeof UICell;
/** Encapsulates a menu; items are mixed in by `DropdownMenuBuilder` */
declare class DropdownMenu extends DropdownMenu_base {
    /** Emit an event with given key */
    emitMenuItemSelectedEvent(key: string): void;
}
/** Default dropdown menu builder, used by `UIMenu` */
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
    /** List of items currently built up */
    private readonly _items;
    private _gravity;
    private _revealTransition?;
    private _exitTransition?;
}
export {};
