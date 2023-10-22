import * as esbuild from 'esbuild';
import {getConfig} from "./config.js";
import {symlink, rm, mkdir} from "node:fs/promises";
import {join} from "node:path";

await rm("dist", {recursive: true}).catch(() => {})
await mkdir("./dist");
await symlink(join(process.cwd(), "./public"), "./dist/public", 'junction');

const context = await esbuild.context(getConfig({
    prod: process.argv.includes('--prod'),
    watch: true
}));


await context.watch();




let { host, port } = await context.serve({
    servedir: 'dist',
    port: +(process.env.PORT || 3208),
    host: '0.0.0.0',
    fallback: 'index.html',
    onRequest(arg){
       // console.log(`[${arg.method}] ${arg.path}: ${arg.timeInMS}`);
    }
});
console.log(`server is running on http://${host}:${port}`)