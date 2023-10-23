declare module "*.module.css";
declare module "*.module.less";
declare interface Window {
    ethereum: import('@metamask/sdk').SDKProvider;
}
