import { htmlPlugin } from '@craftamap/esbuild-plugin-html';
import {readFileSync, writeFileSync} from "node:fs";
import { lessLoader } from 'esbuild-plugin-less';
import * as path from "node:path";
import {chains} from "eth-chains/dist/src/chains.js";

export const getConfig = ({prod, watch, sourceMaps}) => ({
    entryPoints: [
        { out: 'main', in: 'src/index.tsx'},
        { out: 'global', in: 'src/global.less'},
        { out: 'loader', in: 'src/sw/loader.ts'},
        { out: 'sw', in: 'src/sw/index.ts'},
        { out: 'connect', in: 'src/connect.ts'},
    ],
    bundle: true,
    minify: !!prod,
    sourcemap: sourceMaps || !prod,
    target: ['chrome88', 'safari14', 'firefox88'],
    outdir: 'dist',
    metafile: true,
    platform: 'browser',
    treeShaking: !!prod,
    tsconfig: 'tsconfig.json',
    jsx: 'automatic',
    define: {
        DEBUG: (!prod).toString(),
        TRANSACTION_WINDOW: '300'
    },
    external: ["*.woff2"],
    plugins: [
        lessLoader(),
        htmlPlugin({
            files: [{
                entryPoints: ['src/connect.ts', 'src/global.less'],
                inline: true,
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
        metafilePlugin(),
        chainListPlugin()
    ],
});

function chainListPlugin(){
    return {
        name: 'chainListPlugin',
        setup(build) {
            const data = Object.fromEntries(Object.entries(chains).map(([key, value]) =>
                [key, {
                    name: value.name,
                    nativeCurrency: value.nativeCurrency,
                    infoURL: value.infoURL
                }]
            ));
            build.initialOptions.alias ??= {};
            const jsonPath = path.join(build.initialOptions.outdir, 'chains.js');
            build.initialOptions.alias["eth-chains/dist/src/chains.js"] = jsonPath;
            writeFileSync(
                jsonPath,
                `export const chains = ${JSON.stringify(data)};`
            );
        },
    }
}

function metafilePlugin(){
    return {
        name: 'metafileWriter',
        setup(build) {
            build.onEnd((result) => {
                if (result.errors.length === 0) {
                    writeFileSync(
                        path.join(build.initialOptions.outdir, 'assets.json'),
                        JSON.stringify(Object.keys(result.metafile.outputs)
                            .map(x => x.replace(build.initialOptions.outdir, build.initialOptions.publicPath ?? ''))
                        ),
                    );
                    writeFileSync(
                        path.join(build.initialOptions.outdir, 'meta.json'),
                        JSON.stringify(result.metafile),
                    );
                }
            });
        },
    }
};