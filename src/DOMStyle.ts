import {
  UICell,
  UIColumn,
  UIComponent,
  UIContainer,
  UIControl,
  UIRow,
  UIScrollContainer,
  UISeparator,
  UIStyle,
  UITheme,
} from "typescene";
import { DOMRenderContext } from "./DOMRenderContext";

/** @internal Number of logical pixels in a REM unit */
export const DP_PER_REM = 16;

/** Flexbox justify options */
const _flexJustifyOptions = {
  "start": "flex-start",
  "end": "flex-end",
  "center": "center",
  "fill": "space-between",
  "space-around": "space-around",
  "": "",
};

/** Flexbox  alignment options */
const _flexAlignOptions = {
  "start": "flex-start",
  "end": "flex-end",
  "center": "center",
  "stretch": "stretch",
  "baseline": "baseline",
  "": "",
};

/** Root CSS style updater, after creating style element the first time */
let _cssUpdater: ((css: { [spec: string]: any }, allImports: string[]) => void) | undefined;

/** CSS classes currently defined, for IDs of `UIStyle` instances */
let _cssDefined: { [id: string]: true | undefined } = {};

/** Pending CSS update, if any */
let _pendingCSS: { [spec: string]: any } | undefined;

/** All CSS imports */
let _cssImports: string[] = [];

/** Import an external stylesheet */
export function importStylesheet(url: string) {
  _cssImports.push(url);
  setGlobalCSS({});
}

/** @internal Replace given CSS styles in the global root style sheet */
export function setGlobalCSS(css: {
  [spec: string]: Partial<CSSStyleDeclaration> | { [spec: string]: any };
}) {
  if (!_pendingCSS) _pendingCSS = {};
  for (let p in css) _pendingCSS[p] = css[p];
  DOMRenderContext.scheduleRender(() => {
    if (!_cssUpdater) _cssUpdater = _makeCSSUpdater();
    if (_pendingCSS) _cssUpdater(_pendingCSS, _cssImports);
    _pendingCSS = undefined;
  });
}

/** @internal Apply styles from given UI component to given element, using CSS classes and/or overrides */
export function applyElementCSS(
  component: UIComponent,
  element: HTMLElement,
  isNewElement?: boolean,
  additionalClassName?: string
) {
  // set hidden attribute if component is hidden
  if (component.hidden) {
    element.hidden = true;
    element.style.cssText = "";
    return;
  }
  if (element.hidden) element.hidden = false;

  // set inline styles, if any
  let inline: Partial<CSSStyleDeclaration> & { className?: string } = {};
  let className = "UI";
  if (UIStyle.isStyleOverride(component.dimensions)) {
    addDimensionsCSS(inline, component.dimensions);
  }
  if (UIStyle.isStyleOverride(component.position)) {
    addPositionCSS(inline, component.position);
  }
  if (component instanceof UIContainer) {
    if (UIStyle.isStyleOverride(component.layout)) {
      addContainerLayoutCSS(inline, component.layout);
    }
    addContainerCSS(inline, component);
  } else if (component instanceof UIControl) {
    if (UIStyle.isStyleOverride(component.decoration)) {
      addDecorationCSS(inline, component.decoration);
    } else if (component.decoration.cssClassNames) {
      inline.className = component.decoration.cssClassNames.join(" ");
    }
    if (UIStyle.isStyleOverride(component.textStyle)) {
      addTextStyleCSS(inline, component.textStyle);
    }
    if (
      (component.shrinkwrap && component.dimensions.grow) ||
      (!component.shrinkwrap && !component.dimensions.grow)
    ) {
      inline.flexGrow = component.shrinkwrap ? "0" : "1";
    }
    if (component instanceof UISeparator) {
      inline.borderWidth = getCSSLength(component.thickness);
      if (component.color) {
        inline.borderColor = UITheme.replaceColor(component.color);
      }
    }
  }

  // set CSS classes for global style(s), if any
  let styleInstance = component.style;
  if (!_cssDefined[styleInstance.id]) {
    defineStyleClass(styleInstance);
  }
  if (styleInstance.ids.length) {
    className += " " + styleInstance.ids.join(" ");
  }
  if (inline.className) {
    className += " " + inline.className;
    delete inline.className;
  }
  if (additionalClassName) className += " " + additionalClassName;
  element.className = className;

  // apply inline CSS properties as a CSS string
  let cssText = getCSSText(inline);
  if (cssText || !isNewElement) element.style.cssText = cssText;
}

/** @internal Helper method to convert a CSS length unit *or* DP number to a CSS string or given default string (e.g. `auto`) */
export function getCSSLength(length?: UIStyle.Offsets, defaultValue: any = "auto"): string {
  if (typeof length === "string") return length;
  if (typeof length === "number") return length / DP_PER_REM + "rem";
  if (typeof length === "object") {
    let top: string | number = 0;
    let bottom: string | number = 0;
    let left: string | number = 0;
    let right: string | number = 0;
    if (length.x) left = right = getCSSLength(length.x);
    if (length.y) top = bottom = getCSSLength(length.y);
    if (length.top) top = getCSSLength(length.top);
    if (length.bottom) bottom = getCSSLength(length.bottom);
    if (length.left) left = getCSSLength(length.left);
    if (length.right) right = getCSSLength(length.right);
    return top + " " + right + " " + bottom + " " + left;
  }
  return defaultValue;
}

/** Helper method to recursively define CSS class(es) for given instance of `UIStyle` */
function defineStyleClass(style: UIStyle) {
  _cssDefined[style.id] = true;
  let makeDeclaration = (styles: Partial<UIStyle.StyleObjects>) => {
    let result: Partial<CSSStyleDeclaration> = {};
    if (styles.containerLayout) addContainerLayoutCSS(result, styles.containerLayout);
    if (styles.dimensions) addDimensionsCSS(result, styles.dimensions);
    if (styles.position) addPositionCSS(result, styles.position);
    if (styles.textStyle) addTextStyleCSS(result, styles.textStyle);
    if (styles.decoration) addDecorationCSS(result, styles.decoration);
    return result;
  };

  // add CSS to global style element
  setGlobalCSS({
    [".UI" + style.ids.map((id) => "." + id).join("")]: makeDeclaration(
      style.getOwnStyles()
    ),
  } as any);

  // add CSS for conditional styles
  let setGlobalAddonStyle = (suffix: string, k: keyof UIStyle.ConditionalStyles) => {
    let conditional = style.conditionalStyles[k];
    if (!conditional) return;
    let className = ".UI" + style.ids.map((id) => "." + id).join("") + suffix;
    setGlobalCSS({
      [className]: makeDeclaration(conditional.getStyles()),
    } as any);
  };
  setGlobalAddonStyle(":focus", "focused");
  setGlobalAddonStyle(":hover:not([disabled])", "hover");
  setGlobalAddonStyle(":active:not([disabled])", "pressed");
  setGlobalAddonStyle("[disabled]", "disabled");
  setGlobalAddonStyle("[data-selected]", "selected");

  // recurse for inherited styles
  if (style.inherited.length) {
    for (let next of style.inherited) {
      if (!_cssDefined[next.id]) {
        defineStyleClass(next);
      }
    }
  }
}

/** Helper to append CSS styles to given object for a given `UIContainer` instance */
function addContainerCSS(result: Partial<CSSStyleDeclaration>, container: UIContainer) {
  if (container instanceof UICell) {
    if (container.borderThickness) {
      result.borderWidth = getCSSLength(container.borderThickness);
      result.borderColor = UITheme.replaceColor(container.borderColor || "transparent");
      result.borderStyle = String(container.borderStyle || "solid");
    }
    if (container.background)
      result.background = UITheme.replaceColor(container.background);
    if (container.textColor) result.color = UITheme.replaceColor(container.textColor);
    if (container.borderRadius) result.borderRadius = getCSSLength(container.borderRadius);
    if (container.padding) result.padding = getCSSLength(container.padding);
    if (container.margin) result.margin = getCSSLength(container.margin);
    if (container.dropShadow) result.boxShadow = getBoxShadowCSS(container.dropShadow);
    if (container.opacity! >= 0) result.opacity = String(container.opacity);
    if (container.css) {
      // copy all properties to result
      for (let p in container.css) result[p] = container.css[p];
    }
  } else if (container instanceof UIRow) {
    if (container.height !== undefined) {
      result.height = getCSSLength(container.height);
    }
  } else if (container instanceof UIColumn) {
    if (container.width !== undefined) {
      result.width = getCSSLength(container.width);
    }
  }
  if ((container as UIScrollContainer).verticalScrollEnabled) {
    result.overflowY = "auto";
  }
  if ((container as UIScrollContainer).horizontalScrollEnabled) {
    result.overflowX = "auto";
  }
}

/** Helper to append CSS styles to given object for a given `ContainerLayout` object */
function addContainerLayoutCSS(
  result: Partial<CSSStyleDeclaration>,
  layout: UIStyle.ContainerLayout
) {
  let axis = layout.axis;
  if (axis !== undefined) result.flexDirection = axis === "horizontal" ? "row" : "column";
  let distribution = layout.distribution;
  if (distribution !== undefined)
    result.justifyContent = _flexJustifyOptions[distribution] || "";
  let alignment = layout.gravity;
  if (alignment !== undefined) result.alignItems = _flexAlignOptions[alignment] || "";
  let wrapContent = layout.wrapContent;
  if (wrapContent !== undefined) result.flexWrap = wrapContent ? "wrap" : "nowrap";
  let clip = layout.clip;
  if (clip !== undefined) result.overflow = clip ? "hidden" : "visible";
}

/** Helper to append CSS styles to given object for a given `Dimensions` object */
function addDimensionsCSS(
  result: Partial<CSSStyleDeclaration>,
  dimensions: UIStyle.Dimensions
) {
  let width = dimensions.width;
  if (width !== undefined) result.width = getCSSLength(width);
  let height = dimensions.height;
  if (height !== undefined) result.height = getCSSLength(height);
  let minWidth = dimensions.minWidth;
  if (minWidth !== undefined) result.minWidth = getCSSLength(minWidth, "");
  let minHeight = dimensions.minHeight;
  if (minHeight !== undefined) result.minHeight = getCSSLength(minHeight, "");
  let maxWidth = dimensions.maxWidth;
  if (maxWidth !== undefined) result.maxWidth = getCSSLength(maxWidth, "");
  let maxHeight = dimensions.maxHeight;
  if (maxHeight !== undefined) result.maxHeight = getCSSLength(maxHeight, "");
  let grow = dimensions.grow;
  if (grow !== undefined) result.flexGrow = grow as any;
  let shrink = dimensions.shrink;
  if (shrink !== undefined) result.flexShrink = shrink as any;
}

/** Helper to append CSS styles to given object for a given `Position` object */
function addPositionCSS(result: Partial<CSSStyleDeclaration>, position: UIStyle.Position) {
  let alignSelf = position.gravity;
  if (alignSelf === "overlay") {
    result.position = "absolute";
    result.zIndex = "100";
    result.top = getCSSLength(position.top);
    result.bottom = getCSSLength(position.bottom);
    result.left = getCSSLength(position.left);
    result.right = getCSSLength(position.right);
    if (position.left === undefined && position.right === undefined) {
      result.margin = "auto";
    }
  } else {
    if (alignSelf) {
      result.alignSelf = _flexAlignOptions[alignSelf];
    }
    if (
      position.top !== undefined ||
      position.bottom !== undefined ||
      position.left !== undefined ||
      position.right !== undefined
    ) {
      result.position = "relative";
      if (position.top !== undefined) result.top = getCSSLength(position.top);
      if (position.bottom !== undefined) result.bottom = getCSSLength(position.bottom);
      if (position.left !== undefined) result.left = getCSSLength(position.left);
      if (position.right !== undefined) result.right = getCSSLength(position.right);
    }
  }
}

/** Helper to append CSS styles to given object for a given `TextStyle` object */
function addTextStyleCSS(
  result: Partial<CSSStyleDeclaration>,
  textStyle: UIStyle.TextStyle
) {
  let align = textStyle.align;
  if (align !== undefined) result.textAlign = align;
  let color = textStyle.color;
  if (color !== undefined) result.color = UITheme.replaceColor(color);
  let fontFamily = textStyle.fontFamily;
  if (fontFamily !== undefined) result.fontFamily = fontFamily;
  let fontSize = textStyle.fontSize;
  if (fontSize !== undefined) result.fontSize = getCSSLength(fontSize, "inherit");
  let fontWeight = textStyle.fontWeight;
  if (fontWeight !== undefined) result.fontWeight = String(fontWeight);
  let letterSpacing = textStyle.letterSpacing;
  if (letterSpacing !== undefined) result.letterSpacing = getCSSLength(letterSpacing);
  let lineHeight = textStyle.lineHeight;
  if (lineHeight !== undefined) result.lineHeight = String(lineHeight);
  let lineBreakMode = textStyle.lineBreakMode;
  if (lineBreakMode === "clip")
    (result.overflow = "hidden"), (result.textOverflow = "clip");
  else if (lineBreakMode === "ellipsis")
    (result.overflow = "hidden"), (result.textOverflow = "ellipsis");
  else if (lineBreakMode !== undefined) result.whiteSpace = lineBreakMode;
  let bold = textStyle.bold;
  if (bold) result.fontWeight = "bold"; // or explicit fontWeight above
  let italic = textStyle.italic;
  if (italic !== undefined) result.fontStyle = italic ? "italic" : "normal";
  let uppercase = textStyle.uppercase;
  if (uppercase !== undefined) result.textTransform = uppercase ? "uppercase" : "none";
  let smallCaps = textStyle.smallCaps;
  if (smallCaps !== undefined) result.fontVariant = smallCaps ? "small-caps" : "normal";
  let underline = textStyle.underline;
  let strikeThrough = textStyle.strikeThrough;
  if (underline)
    result.textDecoration = "underline" + (strikeThrough ? " line-through" : "");
  else if (strikeThrough) result.textDecoration = "line-through";
  else if (underline === false || strikeThrough === false) result.textDecoration = "none";
}

/** Helper to append CSS styles to given object for a given `Decoration` object */
function addDecorationCSS(
  result: Partial<CSSStyleDeclaration> & { className?: string },
  decoration: UIStyle.Decoration
) {
  let background = decoration.background;
  if (background !== undefined) result.background = UITheme.replaceColor(background);
  let textColor = decoration.textColor;
  if (textColor !== undefined) result.color = UITheme.replaceColor(textColor);
  let border = decoration.border;
  if (border !== undefined) result.border = UITheme.replaceColor(border);
  let borderThickness = decoration.borderThickness;
  if (borderThickness !== undefined) {
    result.borderWidth = getCSSLength(borderThickness);
    result.borderColor = UITheme.replaceColor(decoration.borderColor || "transparent");
    result.borderStyle = decoration.borderStyle || "solid";
  }

  let borderRadius = decoration.borderRadius;
  if (borderRadius !== undefined)
    result.borderRadius = getCSSLength(decoration.borderRadius);
  let padding = decoration.padding;
  if (padding !== undefined) result.padding = getCSSLength(padding);
  if (decoration.dropShadow) result.boxShadow = getBoxShadowCSS(decoration.dropShadow);
  if (decoration.opacity! >= 0) result.opacity = String(decoration.opacity);
  if (decoration.css) {
    // copy all properties to result
    for (let p in decoration.css) result[p] = decoration.css[p];
  }
  if (decoration.cssClassNames) {
    result.className = decoration.cssClassNames.join(" ");
  }
}

/** Helper function to turn given CSS properties into a single string */
function getCSSText(style: any) {
  let result = "";
  for (let p in style) {
    if (p === "className" || style[p] === "" || style[p] == undefined) continue;
    let key = p
      .replace(/([A-Z])/g, "-$1")
      .toLowerCase()
      .replace(/^(webkit|o|ms|moz)-/, "-$1-");
    String(style[p])
      .split("||")
      .reverse()
      .forEach((str) => {
        result += key + ": " + str + "; ";
      });
  }
  return result;
}

/** Helper function to get boxShadow property for given elevation (0-1) */
function getBoxShadowCSS(d = 0) {
  let inset = "";
  if (d < 0) {
    inset = "inset ";
    d = -d;
  }
  d = Math.min(1, Math.max(0, d));
  if (!(d > 0)) return "none";
  return (
    `${inset}0 0 ${d * 2}rem ${d * -0.25}rem rgba(0,0,0,${d * d * 0.3}),` +
    `${inset}0 ${d * 0.85}rem ${d * 1}rem ${d * -0.25}rem rgba(0,0,0,${d * 0.15 + 0.1}),` +
    `${inset}0 ${d * d * 0.5 + d * 0.6}rem ${d * 1}rem ${d * -1}rem rgba(0,0,0,.4),` +
    `${inset}0 ${d * d * 1.5}rem ${d * 3}rem ${d * -1}rem rgba(0,0,0,.3),` +
    `${inset}0 ${d * d * 3}rem ${d * 2.5}rem ${d * -2}rem rgba(0,0,0,.3)`
  );
}

/** Helper function to make a CSS style element updater function */
function _makeCSSUpdater() {
  // create style sheet first
  let elt = document.createElement("style");
  elt.setAttribute("type", "text/css");
  document.head!.appendChild(elt);

  // prepare an updater function
  let styles: { [spec: string]: any } = {};
  return (css: typeof styles, allImports: string[]) => {
    // merge given styles into existing ones
    for (let p in css) {
      if (p[0] === "@" && styles[p]) {
        // merge existing objects
        styles[p] = { ...styles[p], ...css[p] };
      } else {
        // copy all properties
        styles[p] = { ...css[p] };
      }
    }

    // write CSS text to the existing element
    let text = "";
    for (let p in styles) {
      if (p[0] === "@") {
        // write entire block of styles
        text += p + " {\n";
        for (let q in styles[p]) {
          text += "  " + q + " { " + getCSSText(styles[p][q]) + "}\n";
        }
        text += "}\n";
      } else {
        // write single line of styles
        text += p + " { " + getCSSText(styles[p]) + "}\n";
      }
    }
    elt.textContent =
      allImports.map((s) => "@import url(" + JSON.stringify(s) + ");\n") +
      ".UI { display: block }\n" +
      text;
  };
}
