import { UICell } from "typescene";
/** A button with predefined styles for use within a selection group */
export declare const SelectionGroupButton: typeof import("typescene/typings/ui/controls/UIButton").UIButton;
/** A button selection bar, to be populated with `SelectionGroupButton` */
export declare class ButtonSelector extends UICell {
    static preset(presets: UICell.Presets, ...content: Array<typeof SelectionGroupButton>): Function;
}
