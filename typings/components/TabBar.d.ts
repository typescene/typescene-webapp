import { UICell, UIRenderableConstructor } from "typescene";
export declare const TabBarButton: typeof import("typescene/typings/ui/controls/UIButton").UIButton;
export declare class TabBar extends UICell {
    static preset(presets: UICell.Presets, ...content: Array<UIRenderableConstructor>): Function;
}
