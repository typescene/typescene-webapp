import { AppActivationContext, Application } from "typescene";
import "./renderers";
export declare class BrowserApplication extends Application {
    static setGlobalDpSize(size?: number): void;
    constructor(rootDOMElement?: HTMLElement);
    onManagedStateActivatingAsync(): Promise<void>;
    onManagedStateInactiveAsync(): Promise<void>;
    private _rootDOMElement?;
}
export declare class BrowserHashActivationContext extends AppActivationContext {
    constructor();
    navigate(path: string): void;
    onManagedStateDestroyingAsync(): Promise<void>;
    private _setPath;
    private _handler;
}
