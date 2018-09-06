/** Global commonjs `module` variable */
declare global {
    const module: {
        id: string;
        exports: any;
        hot: {
            data: any;
            accept(callback: () => void): void;
            dispose(callback: () => void): void;
        };
    };
}
/** Encapsulates hot module reload (HMR) functions for a view module, which must export exactly one component constructor as `default` or `View` */
export declare namespace HMR {
    /** Enable hot module reloading for given view module, which must export exactly one component constructor as `default` or `View` */
    function enableViewReload(viewModule: typeof module): void;
}
