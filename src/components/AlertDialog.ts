import {
  bind,
  ComponentPresetType,
  ConfirmationDialogBuilder,
  tt,
  UIBorderlessButton,
  UICell,
  UICloseRow,
  UIColumn,
  UIExpandedLabel,
  UIFlowCell,
  UILabel,
  UILinkButton,
  UIOppositeRow,
  UIParagraph,
  UIPrimaryButton,
  UISpacer,
  ViewComponent,
} from "typescene";

/** Simple modal message dialog UI component; emits `Confirm` and `CloseModal` events */
export class AlertDialog extends ViewComponent.with(
  UICell.with(
    {
      background: "@background",
      borderRadius: 4,
      position: { gravity: "center" },
      dimensions: { maxWidth: 400, width: "95vw" },
      dropShadow: 0.65,
      revealTransition: "up-fast",
    },
    UIFlowCell.with(
      {
        background: "@primary",
        dimensions: { height: 40 },
        hidden: bind("title|!"),
        onMouseDown: "+DragContainer",
      },
      UICloseRow.with(
        UISpacer.withWidth(16),
        UIExpandedLabel.withText(bind("title"), { color: "@primary:text" }),
        UIBorderlessButton.with({
          position: { gravity: "center" },
          icon: "close",
          onClick: "+CloseModal",
          iconSize: 18,
          iconColor: "@primary:text",
          disableKeyboardFocus: true,
        })
      )
    ),
    UICell.with(
      { padding: 16 },
      UIColumn.with({
        content: bind("messageLabels"),
      }),
      UISpacer.withHeight(24),
      UIOppositeRow.with(
        { padding: 0 },
        UILinkButton.with({
          hidden: bind("cancelButtonLabel|!"),
          label: bind("cancelButtonLabel"),
          onClick: "+CloseModal",
        }),
        UIPrimaryButton.with({
          label: bind("confirmButtonLabel"),
          onClick: "+Confirm",
          requestFocus: true,
        })
      )
    )
  )
) {
  static preset: ViewComponent.PresetFor<
    AlertDialog,
    "messages" | "title" | "confirmButtonLabel" | "cancelButtonLabel"
  >;

  /** Message(s) to be displayed */
  get messages() {
    return this._messages;
  }
  set messages(v) {
    this._messages = v;
    let labels: UILabel[] = [];
    if (v) for (let s of v) labels.push(new UIParagraph(s));
    this.messageLabels = labels;
  }
  private _messages?: string[];

  /** Message labels (paragraphs) */
  messageLabels: UILabel[] = [];

  /** Dialog title */
  title?: string;

  /** Label for the confirmation button */
  confirmButtonLabel = tt("Dismiss");

  /** Label for the cancellation button; if none specified, only the confirmation button will be displayed */
  cancelButtonLabel?: string;
}

/** Default alert dialog builder, builds an `AlertDialog` constructor */
export class AlertDialogBuilder extends ConfirmationDialogBuilder {
  build() {
    return AlertDialog.with(this._presets);
  }
  setTitle(title: string) {
    this._presets.title = title;
    return this;
  }
  setConfirmButtonLabel(label: string) {
    this._presets.confirmButtonLabel = label;
    return this;
  }
  setCancelButtonLabel(label: string) {
    this._presets.cancelButtonLabel = label;
    return this;
  }
  addMessage(message: string) {
    this._presets.messages!.push(message);
    return this;
  }
  private readonly _presets: Partial<ComponentPresetType<typeof AlertDialog>> = {
    messages: [],
  };
}
