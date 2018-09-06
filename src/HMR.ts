import { Application, Component } from "typescene";

/** Global commonjs `module` variable */
declare global {
    const module: {
        id: string;
        exports: any;
        hot: {
            data: any;
            accept(callback: () => void): void;
            dispose(callback: () => void): void;
        }
    };
}

/** Encapsulates hot module reload (HMR) functions for a view module, which must export exactly one component constructor as `default` or `View` */
export namespace HMR {
    /** Enable hot module reloading for given view module, which must export exactly one component constructor as `default` or `View` */
    export function enableViewReload(viewModule: typeof module) {
        if (viewModule.hot) {
            // add a callback for the incoming module:
            if (viewModule.hot.data && viewModule.hot.data.updateActivity) {
                viewModule.hot.accept(() => {
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
                });
            }

            // find view activities that use the exported view constructor
            // (use hidden #activity:n methods to reload views later)
            setTimeout(() => {
                let ViewClass = viewModule.exports.default || viewModule.exports.View;
                if (ViewClass && (ViewClass.prototype instanceof Component)) {
                    if ((ViewClass as any)["@updateActivity"]) {
                        // add callback for when a module is disposed of:
                        viewModule.hot.dispose(() => {
                            viewModule.hot.data.updateActivity = (ViewClass as any)["@updateActivity"];
                        });
                    }
                }
            }, 10);
        }
    }
}
