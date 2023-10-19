import * as esbuild from 'esbuild';

await esbuild.build({
    entryPoints: ['./lib.ts'],
    bundle: true,
    outdir: 'dist',
    metafile: true,
    platform: 'node',
    tsconfig: 'tsconfig.json',
    format: "esm",
    external: ['@cmmn'],
    define: {
        localStorage: "{}"
    }
});