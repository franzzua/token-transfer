import {encode} from "@urlpack/base62";

export const id = () => encode(crypto.getRandomValues(new Uint8Array(8)))