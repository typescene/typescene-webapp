import { UIComponentEvent, UIRenderableConstructor, UIStyle, ViewComponent } from "typescene";
declare const TopNavBar_base: typeof ViewComponent;
/** Top navigation bar component, to be preset with a title and left/right button(s) */
export declare class TopNavBar extends TopNavBar_base {
    static preset(presets: {
        /** Background color */
        background?: string;
        /** Overall text color */
        textColor?: string;
        /** Title text */
        title?: string;
        /** Icon displayed to the left of the title */
        icon?: string;
        /** (Partial) text style to be applied to the title label */
        textStyle?: Partial<UIStyle.TextStyle>;
    }, lhsButton?: UIRenderableConstructor, ...content: UIRenderableConstructor[]): Function;
    background: string;
    textColor: string;
    title: string;
    icon: string;
    /** Text style override for the heading label */
    textStyle?: Partial<UIStyle.TextStyle>;
    protected onBeforeRender(e: UIComponentEvent): void;
    private _lhsButton?;
    private _content;
}
export {};
