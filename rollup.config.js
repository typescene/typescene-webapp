import multiEntry from "rollup-plugin-multi-entry";
import resolve from "rollup-plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

export default {
    input: ["dist/index.js", "node_modules/typescene/dist/index.js"],
    output: {
        file: "umd/typescene.min.js",
        format: "umd",
        name: "typescene"
    },
    plugins: [
        multiEntry(),
        resolve(),
        terser({
            compress: {
                passes: 3
            },
            mangle: {
                properties: { regex: /^_/ }
            }
        })
    ],
    onwarn: (warning) => {
        if (warning.code !== 'CIRCULAR_DEPENDENCY') {
            console.warn(`- ${warning.message}`)
        }
    }
}
