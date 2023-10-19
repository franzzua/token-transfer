import * as esbuild from 'esbuild';
import {getConfig} from "./config.js";

const context = await esbuild.context(getConfig({
    prod: process.argv.includes('--prod'),
    watch: true
}));


await context.watch({

});

let { host, port } = await context.serve({
    servedir: '.',
    port: +(process.env.PORT || 3208),
    host: '0.0.0.0',
    fallback: './dist/index.html'
});
console.log(`server is running on http://${host}:${port}`)