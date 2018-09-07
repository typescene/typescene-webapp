import { ConfirmationDialogBuilder, UILabel, ViewComponent } from "typescene";
declare const AlertDialog_base: typeof ViewComponent;
export declare class AlertDialog extends AlertDialog_base {
    static preset: ViewComponent.PresetFor<AlertDialog, "messages" | "title" | "confirmButtonLabel" | "cancelButtonLabel">;
    messages: string[] | undefined;
    private _messages?;
    messageLabels: UILabel[];
    title?: string;
    confirmButtonLabel: string;
    cancelButtonLabel?: string;
}
export declare class AlertDialogBuilder extends ConfirmationDialogBuilder {
    build(): typeof AlertDialog;
    setTitle(title: string): this;
    setConfirmButtonLabel(label: string): this;
    setCancelButtonLabel(label: string): this;
    addMessage(message: string): this;
    private readonly _presets;
}
export {};
