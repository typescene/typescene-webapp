import {
  bind,
  ComponentPresetType,
  ConfirmationDialogBuilder,
  strf,
  UIBorderlessButton,
  UICell,
  UICloseRow,
  UIExpandedLabel,
  UIFlowCell,
  UILabel,
  UILinkButton,
  UIOppositeRow,
  UIParagraph,
  UIPrimaryButton,
  UISpacer,
  ViewComponent,
  Stringable,
  UICloseColumn,
} from "typescene";

/** Default modal message dialog UI component; emits `Confirm` and `CloseModal` events */
export class AlertDialog extends ViewComponent.with({
  defaults: () => ({
    /** Messages to be displayed */
    messages: [] as Stringable[],
    /** Dialog title */
    title: undefined as Stringable | undefined,
    /** Label for the confirmation button */
    confirmButtonLabel: strf("Dismiss") as Stringable,
    /** Label for the cancellation button; if none specified, only the confirmation button will be displayed */
    cancelButtonLabel: undefined as Stringable | undefined,
  }),
  view: UICell.with(
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
      UICloseColumn.with({
        content: bind("messageLabels", []),
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
  ),
}) {
  protected beforeRender() {
    let labels: UILabel[] = [];
    for (let s of this.messages!) labels.push(new UIParagraph(s));
    this.messageLabels = labels;
  }

  /** Message labels (paragraphs) */
  messageLabels?: UILabel[];
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
