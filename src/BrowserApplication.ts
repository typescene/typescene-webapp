import { AppActivationContext, Application, UITheme } from "typescene";
import { BrowserTheme, initializeCSS } from "./BrowserTheme";
import { DOMRenderContext } from "./DOMRenderContext";
import { DP_PER_REM, setGlobalCSS } from "./DOMStyle";
import "./renderers";

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

    /** Create a browser application to be rendered within given DOM element (or to a wrapper that covers the entire window if no element is provided). */
    constructor(rootDOMElement?: HTMLElement) {
        super();
        if (!rootDOMElement) document.body.innerHTML = "";
        this.renderContext = new DOMRenderContext(rootDOMElement);
        this.activationContext = new BrowserHashActivationContext();
        (window as any).app = this;
        (window as any).BrowserTheme = BrowserTheme;
        (window as any).BrowserApplication = BrowserApplication;
    }
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
