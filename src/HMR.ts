import { Application, Component } from "typescene";

/** Encapsulates hot module reload (HMR) functions for a view module, which must export exactly one component constructor as `default` or `View` */
export namespace HMR {
    /** Enable hot module reloading for given view module, which must export exactly one component constructor as `default` or `View` */
    export function enableViewReload(viewModule: any) {
        if (viewModule.hot) {
            // accept new modules, and link up the new view class
            viewModule.hot.accept();
            if (viewModule.hot.data && viewModule.hot.data.updateActivity) {
                setTimeout(() => {
                    let ViewClass = viewModule.exports.default || viewModule.exports.View;
                    if (ViewClass && (ViewClass.prototype instanceof Component)) {
                        // reset all view constructors, then trigger reactivation
                        viewModule.hot.data.updateActivity(ViewClass);
                        Application.active.forEach(app => {
                            app.renderContext && app.renderContext.emitRenderChange();
                        });
                    }
                }, 0);
            }
            setTimeout(() => {
                // find the exported view class and add a dispose callback
                let ViewClass = viewModule.exports.default || viewModule.exports.View;
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
    }
}
