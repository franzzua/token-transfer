import type {SDKProvider} from "@metamask/sdk";

declare module "*.css" {
    const style: Record<string, string>;
    export default style;
}
declare interface Window {
    ethereum: SDKProvider;
}
