import * as esbuild from 'esbuild';
import {getConfig} from "./config.js";

await esbuild.build(getConfig({
    prod: true,
    watch: false
})).catch(console.error);
