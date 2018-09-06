import { ConfirmationDialogBuilder, UILabel, ViewComponent } from "typescene";
declare const AlertDialog_base: typeof ViewComponent;
/** Simple modal message dialog UI component; emits `Confirm` and `CloseModal` events */
export declare class AlertDialog extends AlertDialog_base {
    static preset: ViewComponent.PresetFor<AlertDialog, "messages" | "title" | "confirmButtonLabel" | "cancelButtonLabel">;
    /** Message(s) to be displayed */
    messages: string[] | undefined;
    private _messages?;
    /** Message labels (paragraphs) */
    messageLabels: UILabel[];
    /** Dialog title */
    title?: string;
    /** Label for the confirmation button */
    confirmButtonLabel: string;
    /** Label for the cancellation button; if none specified, only the confirmation button will be displayed */
    cancelButtonLabel?: string;
}
/** Default alert dialog builder, builds an `AlertDialog` constructor */
export declare class AlertDialogBuilder extends ConfirmationDialogBuilder {
    build(): typeof AlertDialog;
    setTitle(title: string): this;
    setConfirmButtonLabel(label: string): this;
    setCancelButtonLabel(label: string): this;
    addMessage(message: string): this;
    private readonly _presets;
}
export {};
