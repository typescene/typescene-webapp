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
export declare namespace HMR {
    function enableViewReload(viewModule: typeof module): void;
}
