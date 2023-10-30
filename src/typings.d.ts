declare module "*.module.css";
declare module "*.module.less";
declare interface Window {
    ethereum: import('@metamask/sdk').SDKProvider;
    TokenTransferApp: {isStarted: boolean;start();stop();}
}

declare const TRANSACTION_WINDOW: number;
declare const DEBUG: boolean;

type Transfer = {
    _id: string;
    amount: string;
    tokenAddress: string;
    to: string;
    state: 'initial';
    fee: 'slow'|'fast'|'average';
}
type TransferSent = Omit<Transfer, 'fee'|'amount'|'state'> & {
    from: string;
    chainId: number;
    amount: bigint;
    maxPriorityFeePerGas: bigint;
    initialMaxPriorityFeePerGas: bigint;
    state: 'pending'|'signed'|'mined'|'rejected';
    blockHash: string;
    blockNumber: number;
    nonce: number;
}

type TokenInfo = {
    chainId: number;
    address: string | null;
    symbol: string;
    name: string;
    decimals: number;
    // extensions?: {
    //     bridgeInfo: Record<string, {
    //         tokenAddress: string;
    //     }>
    // }
}

declare namespace React {
    export interface HTMLAttributes<T> {
        // extends React's HTMLAttributes
        flex?: 'row'|'column';
        gap?: '0.5'|'1'|'1.5'|'2'|'3'|'4';
        align?: 'center'|'start'|'end';
        justify?: 'center'|'between'|'around';
        wrap?: 'wrap';
    }
}