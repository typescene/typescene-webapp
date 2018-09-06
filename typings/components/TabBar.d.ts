import { UICell, UIRenderableConstructor } from "typescene";
/** A button with predefined styles for use within a tab bar */
export declare const TabBarButton: typeof import("typescene/typings/ui/controls/UIButton").UIButton;
/** A bar containing tabs, for use above other content */
export declare class TabBar extends UICell {
    static preset(presets: UICell.Presets, ...content: Array<UIRenderableConstructor>): Function;
}
