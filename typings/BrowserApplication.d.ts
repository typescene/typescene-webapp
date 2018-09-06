import { AppActivationContext, Application } from "typescene";
import "./renderers";
/** Represents an application that runs in a browser using the available DOM APIs. Automatically creates a renderer that renders all UI components in the browser. */
export declare class BrowserApplication extends Application {
    /** Set global (page-wide) relative size of DP units in nominal pixels, defaults to 1 */
    static setGlobalDpSize(size?: number): void;
    /** Create a browser application to be rendered within given DOM element (or to a wrapper that covers the entire window if no element is provided). */
    constructor(rootDOMElement?: HTMLElement);
}
/** Activation context that is used by the `BrowserApplication` type, which takes the target path from the browser window location 'hash' (e.g. `...#/foo/bar`) */
export declare class BrowserHashActivationContext extends AppActivationContext {
    constructor();
    navigate(path: string): void;
    onManagedStateDestroyingAsync(): Promise<void>;
    private _setPath;
    private _handler;
}
