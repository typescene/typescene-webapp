import {
  UICell,
  UIComponent,
  UIComponentEvent,
  UIExpandedLabel,
  UILabel,
  UIMenuBuilder,
  UIMenuItemSelectedEvent,
  UIRenderableConstructor,
  UISeparator,
  UISpacer,
  UIStyle,
  Stringable,
} from "typescene";

/** Encapsulates a menu; items are mixed in by `DropdownMenuBuilder` */
class DropdownMenu extends UICell.with({
  background: "@background",
  dimensions: { minWidth: 50, maxWidth: 280 },
  borderRadius: 4,
  dropShadow: 0.8,
  onArrowDownKeyPress(e: UIComponentEvent) {
    if (!(e.source instanceof DropdownMenu)) return;
    for (let item of (this as UICell).content) {
      if (item instanceof UICell) {
        item.requestFocus();
        return;
      }
    }
  },
}) {
  /** Emit an event with given key */
  emitMenuItemSelectedEvent(key: string) {
    this.emit(UIMenuItemSelectedEvent, "SelectMenuItem", this, key);
  }
}

/** Default dropdown menu builder, used by `UIMenu` */
export class DropdownMenuBuilder extends UIMenuBuilder {
  static labelStyleMixin: Partial<UIStyle.TextStyle> = {};
  static hintStyleMixin: Partial<UIStyle.TextStyle> = { color: "@text/50%", fontSize: 12 };

  clear() {
    this._items.length = 0;
    return this;
  }

  addOption(
    key: string,
    text: Stringable,
    icon?: string,
    hint?: Stringable,
    hintIcon?: string,
    textStyle: Partial<UIStyle.TextStyle> = DropdownMenuBuilder.labelStyleMixin,
    hintStyle: Partial<UIStyle.TextStyle> = DropdownMenuBuilder.hintStyleMixin
  ) {
    function onClick(this: UIComponent) {
      let menu = this.getParentComponent(DropdownMenu);
      if (menu) menu.emitMenuItemSelectedEvent(key);
      this.emitAction("CloseModal");
    }
    this._items.push(
      UICell.with(
        {
          layout: { axis: "horizontal" },
          css: { cursor: "pointer" },
          allowKeyboardFocus: true,
          onMouseEnter() {
            this.background = "@primary";
            this.textColor = "@primary:text";
          },
          onMouseLeave() {
            this.background = "";
            this.textColor = "";
          },
          onClick,
          onEnterKeyPress: onClick,
          onArrowDownKeyPress: function () {
            this.requestFocusNext();
          },
          onArrowUpKeyPress: function () {
            this.requestFocusPrevious();
          },
        },
        UISpacer.with({ dimensions: { width: 16, shrink: 0 }, shrinkwrap: true }),
        UIExpandedLabel.with({ text, icon, iconMargin: 8, textStyle }),
        hint ? UISpacer.withWidth(8) : undefined,
        hint
          ? UILabel.with({ text: hint, icon: hintIcon, textStyle: hintStyle })
          : undefined,
        UISpacer.withWidth(16)
      )
    );
    return this;
  }

  addSelectionGroup(
    options: Array<{ key: string; text: Stringable }>,
    selectedKey?: string,
    textStyle?: Partial<UIStyle.TextStyle>
  ) {
    for (let option of options) {
      this.addOption(
        option.key,
        option.text,
        option.key === selectedKey ? "check" : "blank",
        undefined,
        undefined,
        textStyle
      );
    }
    return this;
  }

  addSeparator() {
    this._items.push(UISeparator.with({ margin: 8 }));
    return this;
  }

  setGravity(gravity: "start" | "stretch" | "end") {
    this._gravity = gravity;
    return this;
  }

  setRevealTransition(transition: string) {
    this._revealTransition = transition;
    return this;
  }

  setExitTransition(transition: string) {
    this._exitTransition = transition;
    return this;
  }

  build() {
    return DropdownMenu.with({
      position: { gravity: this._gravity },
      revealTransition: this._revealTransition,
      exitTransition: this._exitTransition,
      content: [new UISpacer(8, 8), ...this._items.map(C => new C()), new UISpacer(8, 8)],
    });
  }

  /** List of items currently built up */
  private readonly _items: UIRenderableConstructor[] = [];
  private _gravity: "start" | "stretch" | "end" = "end";
  private _revealTransition?: string;
  private _exitTransition?: string;
}
