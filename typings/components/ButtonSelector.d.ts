import { UICell } from "typescene";
export declare const SelectionGroupButton: typeof import("typescene/typings/ui/controls/UIButton").UIButton;
export declare class ButtonSelector extends UICell {
    static preset(presets: UICell.Presets, ...content: Array<typeof SelectionGroupButton>): Function;
}
