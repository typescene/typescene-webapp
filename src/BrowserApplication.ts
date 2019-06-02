import { AppActivationContext, Application, UITheme } from "typescene";
import { BrowserTheme, initializeCSS } from "./BrowserTheme";
import { DOMRenderContext } from "./DOMRenderContext";
import { DP_PER_REM, importStylesheet, setGlobalCSS } from "./DOMStyle";
import "./renderers";

let _transitionsDisabled = false;

// apply global styles immediately
initializeCSS();
let _theme = UITheme.current = new BrowserTheme();
_theme.setFocusOutline();

/** Represents an application that runs in a browser using the available DOM APIs. Automatically creates a renderer that renders all UI components in the browser. */
export class BrowserApplication extends Application {
    /** Set global (page-wide) relative size of DP units in nominal pixels, defaults to 1 */
    static setGlobalDpSize(size = 1) {
        setGlobalCSS({
            html: { fontSize: (size * DP_PER_REM) + "px" }
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
    static get transitionsDisabled() { return _transitionsDisabled }

    /** Create a browser application to be rendered within given DOM element (or to a wrapper that covers the entire window if no element is provided). */
    constructor(rootDOMElement?: HTMLElement) {
        super();
        this._rootDOMElement = rootDOMElement;
    }

    /** Activate the application by creating a new render context and activation context if needed */
    async onManagedStateActivatingAsync() {
        await super.onManagedStateActivatingAsync();
        if (!this._rootDOMElement) document.body.innerHTML = "";
        this.renderContext = new DOMRenderContext(this._rootDOMElement);
        this.activationContext = new BrowserHashActivationContext();
    }

    /** Deactivate the application by removing the render context and activation context */
    async onManagedStateInactiveAsync() {
        await super.onManagedStateInactiveAsync();
        this.renderContext = undefined;
        this.activationContext = undefined;
    }

    private _rootDOMElement?: HTMLElement;
}

/** Activation context that is used by the `BrowserApplication` type, which takes the target path from the browser window location 'hash' (e.g. `...#/foo/bar`) */
export class BrowserHashActivationContext extends AppActivationContext {
    constructor() {
        super();
        window.addEventListener("hashchange",
            this._handler = () => { this._setPath() });
        this._setPath();
    }

    navigate(path: string) {
        let target: string;
        path = String(path);
        if (path === ":back") {
            window.history.back();
            return;
        }
        if (path[0] === "/") {
            target = path;
        }
        else {
            let current = this.target;
            if (current.slice(-1) !== "/") current += "/";
            target = "/" + current + path;
        }
        target = target.replace(/\/+/g, "/");
        let i = 0;
        while (/\/\.\.?\//.test(target)) {
            if (i++ > 100) break;
            target = target.replace(/\/\.\//g, "/")
                .replace(/\/[^\/]+\/\.\.\//g, "/")
                .replace(/^\/?\.\.\//, "/");
        }
        window.location.hash = "#/" + target.replace(/^\/+/, "");
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
