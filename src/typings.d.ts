declare module "*.module.css";
declare module "*.module.less";
declare interface Window {
    ethereum: import('@metamask/sdk').SDKProvider;
    TokenTransferApp: {start();stop();}
}



type Transfer = {
    _id: string;
    id: string | null;
    amount: bigint;
    tokenAddress: string;
    to: string;
    state: string;
    fee: 'slow'|'fast'|'average';
}