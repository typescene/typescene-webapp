import { AppActivationContext, Application } from "typescene";
import { DOMRenderContext } from "./DOMRenderContext";
import {
  DP_PER_REM,
  importStylesheet,
  setGlobalCSS,
  clearGlobalCSSState,
} from "./DOMStyle";

let _transitionsDisabled = false;

/** Represents an application that runs in a browser using the available DOM APIs. Automatically creates a renderer that renders all UI components in the browser. */
export class BrowserApplication extends Application {
  /** Set global (page-wide) relative size of DP units in nominal pixels, defaults to 1 */
  static setGlobalDpSize(size = 1) {
    size *= DP_PER_REM;
    setGlobalCSS({
      html: { fontSize: size + "px" },
    });
  }

  /** Import an external stylesheet from given URL (asynchronously) */
  static importStylesheet(url: string) {
    importStylesheet(url);
  }

  /** Set global (page-wide) setting to disable all transition animations in rendered components */
  static disableTransitions() {
    _transitionsDisabled = true;
  }

  /** True if transitions have been disabled using `disableTransitions()` */
  static get transitionsDisabled() {
    return _transitionsDisabled;
  }

  /** Create a browser application to be rendered within given DOM element (or to a wrapper that covers the entire window if no element is provided). */
  constructor(rootDOMElement?: HTMLElement) {
    super();
    this._root = rootDOMElement;
  }

  /** Activate the application by creating a new render context and activation context if needed */
  async onManagedStateActivatingAsync() {
    await super.onManagedStateActivatingAsync();
    if (!this.renderContext) {
      // clear the rest of the page if not mounted to a DOM element
      if (!this._root) document.body.innerHTML = "";

      // create the render context
      this.renderContext = new DOMRenderContext(this._root);
    }
    if (!this.activationContext) {
      // create the activation context (hash/history based API)
      this.activationContext = this._useHistoryAPI
        ? new BrowserHistoryAPIActivationContext()
        : new BrowserHashActivationContext();
    }
  }

  /** Deactivate the application by removing the render context and activation context */
  async onManagedStateInactiveAsync() {
    await super.onManagedStateInactiveAsync();
    this.renderContext = undefined;
    this.activationContext = undefined;
  }

  /**
   * Use given DOM element to contain the application output, by creating a new renderer instance that is mounted to given element.
   * @note By default, `BrowserApplication` occupies the entire page and clears everything else from the same page. Use this method _immediately_ after creating the application to prevent clearing the page, or supply a DOM element as a constructor argument if instantiating the application manually.
   */
  mount(element: HTMLElement) {
    this._root = element;
    if (this.renderContext) {
      this.renderContext = new DOMRenderContext(element);
    }
    return this;
  }

  /** Remove the application output from the screen by destroying the renderer instance */
  unmount() {
    this._root = undefined;
    this.renderContext = undefined;
    return this;
  }

  /** Use the browser History API intead of hash-URLs */
  useHistoryAPI() {
    this._useHistoryAPI = true;
    if (this.activationContext) {
      this.activationContext = new BrowserHistoryAPIActivationContext();
    }
    return this;
  }

  private _root?: HTMLElement;
  private _useHistoryAPI?: boolean;
}
BrowserApplication.addObserver(
  class {
    onRenderContextChange() {
      // when render context changes, make sure all CSS classes are redefined
      clearGlobalCSSState();
    }
  }
);

/** Activation context that is used by the `BrowserApplication` type, which takes the target path from the browser window location 'hash' (e.g. `...#/foo/bar`) */
export class BrowserHashActivationContext extends AppActivationContext {
  constructor() {
    super();
    this._handler = () => {
      this._setPath();
    };
    window.addEventListener("hashchange", this._handler);
    this._setPath();
  }

  /** Convert given path into a valid href (used by Button renderer) */
  getPathHref(path?: string) {
    let target = "";
    if (!path || path[0] === ":") return "";
    if (path[0] === "#") path = path.slice(1);
    if (path[0] === "/") {
      target = path;
    } else {
      let current = this.target;
      if (current.slice(-1) !== "/") current += "/";
      target = "/" + current + path;
    }
    target = target.replace(/\/+/g, "/");
    let i = 0;
    while (/\/\.\.?\//.test(target)) {
      if (i++ > 100) break;
      target = target
        .replace(/\/\.\//g, "/")
        .replace(/\/[^\/]+\/\.\.\//g, "/")
        .replace(/^\/?\.\.\//, "/");
    }
    return "#/" + target.replace(/^\/+/, "");
  }

  navigate(path: string) {
    path = String(path);
    if (path === ":back") {
      window.history.back();
      return;
    }
    window.location.hash = this.getPathHref(path);
  }

  async onManagedStateDestroyingAsync() {
    window.removeEventListener("hashchange", this._handler);
  }

  private _setPath() {
    let hash = String(window.location.hash || "").replace(/^\#\/?/, "");
    this.target = hash;
  }

  private _handler: () => void;
}

/** Activation context that is used by the `BrowserApplication` type, which takes the target path from the browser history API (i.e. full path) */
export class BrowserHistoryAPIActivationContext extends AppActivationContext {
  constructor() {
    super();
    this._handler = () => {
      this._setPath();
    };
    window.addEventListener("popstate", this._handler);
    this._setPath();
  }

  /** Convert given path into a valid href (used by Button renderer) */
  getPathHref(path?: string) {
    let target = "";
    if (!path || path[0] === ":") return "";
    if (path[0] === "#") path = path.slice(1);
    if (path[0] === "/") {
      target = path;
    } else {
      let current = this.target;
      if (current.slice(-1) !== "/") current += "/";
      target = "/" + current + path;
    }
    target = target.replace(/\/+/g, "/");
    let i = 0;
    while (/\/\.\.?\//.test(target)) {
      if (i++ > 100) break;
      target = target
        .replace(/\/\.\//g, "/")
        .replace(/\/[^\/]+\/\.\.\//g, "/")
        .replace(/^\/?\.\.\//, "/");
    }
    return "/" + target.replace(/^\/+/, "");
  }

  navigate(path: string) {
    path = String(path);
    if (path === ":back") {
      window.history.back();
      return;
    }
    window.history.pushState({}, document.title, this.getPathHref(path));
    this._setPath();
  }

  async onManagedStateDestroyingAsync() {
    window.removeEventListener("popstate", this._handler);
  }

  private _setPath() {
    let path = String(window.location.pathname || "").replace(/^\/?/, "");
    this.target = path;
  }

  private _handler: () => void;
}
