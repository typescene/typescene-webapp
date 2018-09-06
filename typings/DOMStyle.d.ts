import { UICellOffsets, UIComponent } from "typescene";
/** @internal Number of logical pixels in a REM unit */
export declare const DP_PER_REM = 16;
/** Import an external stylesheet */
export declare function importStylesheet(url: string): void;
/** @internal Replace given CSS styles in the global root style sheet */
export declare function setGlobalCSS(css: {
    [spec: string]: Partial<CSSStyleDeclaration> | {
        [spec: string]: any;
    };
}): void;
/** @internal Apply styles from given UI component to given element, using CSS classes and/or overrides */
export declare function applyElementCSS(component: UIComponent, element: HTMLElement, isNewElement?: boolean, additionalClassName?: string): void;
/** @internal Helper method to convert a CSS length unit *or* DP number to a CSS string or given default string (e.g. `auto`) */
export declare function getCSSLength(length?: UICellOffsets, defaultValue?: any): string;
