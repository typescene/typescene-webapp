import { Application, CHANGE, Component, ComponentConstructor } from "typescene";

/** Encapsulates hot module reload (HMR) functions for a view module, which must export exactly one component constructor as `default` or `View` */
export namespace HMR {
    /** Enable hot module reloading for given view module (must be referenced by a `ViewActivity` class), to reload activity views that are created from given class without reinstantiating the activity itself */
    export function enableViewReload<T extends ComponentConstructor>(viewModule: any, ViewClass: T): T {
        if (viewModule.hot) {
            // accept new modules, and link up the new view class
            viewModule.hot.accept();
            if (viewModule.hot.data && viewModule.hot.data.updateActivity) {
                setTimeout(() => {
                    ViewClass = ViewClass ||
                        viewModule.exports.default ||
                        viewModule.exports.View;
                    if (ViewClass && (ViewClass.prototype instanceof Component)) {
                        // reset all view constructors, then trigger reactivation
                        viewModule.hot.data.updateActivity(ViewClass);
                        Application.active.forEach(app => {
                            if (!app.renderContext) return;
                            app.renderContext.getAppComponents()
                                .forEach(c => c.emit(CHANGE));
                        });
                    }
                }, 0);
            }
            setTimeout(() => {
                // find the exported view class and add a dispose callback
                // (to be called above after loading new module's view class)
                ViewClass = ViewClass ||
                    viewModule.exports.default ||
                    viewModule.exports.View;
                if (ViewClass && (ViewClass.prototype instanceof Component)) {
                    if ((ViewClass as any)["@updateActivity"]) {
                        viewModule.hot.dispose((data?: any) => {
                            // (Webpack supplies `data` but Parcel does not)
                            if (!data) data = viewModule.hot.data;
                            data.updateActivity = (ViewClass as any)["@updateActivity"];
                        });
                    }
                }
            }, 10);
        }
        return ViewClass;
    }
}
