import { UIComponentEvent, UIRenderableConstructor, UIStyle, ViewComponent } from "typescene";
declare const TopNavBar_base: typeof ViewComponent;
export declare class TopNavBar extends TopNavBar_base {
    static preset(presets: {
        background?: string;
        textColor?: string;
        title?: string;
        icon?: string;
        textStyle?: Partial<UIStyle.TextStyle>;
    }, lhsButton?: UIRenderableConstructor, ...content: UIRenderableConstructor[]): Function;
    background: string;
    textColor: string;
    title: string;
    icon: string;
    textStyle?: Partial<UIStyle.TextStyle>;
    protected onBeforeRender(e: UIComponentEvent): void;
    private _lhsButton?;
    private _content;
}
export {};
