import { htmlPlugin } from '@craftamap/esbuild-plugin-html';
import {readFileSync, writeFileSync} from "node:fs";
import * as path from "node:path";
export const getConfig = ({prod, watch}) => ({
    entryPoints: ['src/index.tsx', 'src/global.css', 'src/sw/index.ts', 'src/sw/loader.ts'],
    bundle: true,
    minify: !!prod,
    sourcemap: !prod,
    target: ['chrome88', 'safari14', 'firefox88'],
    outdir: 'dist',
    publicPath: '/dist',
    metafile: true,
    treeShaking: prod,
    tsconfig: 'tsconfig.json',
    jsx: 'automatic',
    plugins: [
        htmlPlugin({
            files: [{
                entryPoints: [],
                filename: 'index.html',
                htmlTemplate: readFileSync('./src/index.html'),
                extraScripts: watch ? [
                    `data:text/javascript,new EventSource('/esbuild').addEventListener('change', () => location.reload())`
                ] : [],
                define: {
                    prod
                }
            }]
        }),
        metafilePlugin()
    ],
});

function metafilePlugin(){
    return {
        name: 'metafileWriter',
        setup(build) {
            build.onEnd((result) => {
                if (result.errors.length === 0) {
                    writeFileSync(
                        path.join(build.initialOptions.outdir, 'assets.json'),
                        JSON.stringify(Object.keys(result.metafile.outputs)
                            .map(x => x.replace(build.initialOptions.outdir, build.initialOptions.publicPath))
                        ),
                    );
                }
            });
        },
    }
};