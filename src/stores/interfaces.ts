import {Cell} from "@cmmn/cell/lib";


export interface AmountInputStore {
    get Transfer(): { amount: string; }
    TokenInfo: Cell<TokenInfo>;
    get errors(): {amount: string | null;};
    balance?: string;
    patch(diff: Partial<Pick<Transfer, "amount"|"tokenAddress">>): void;

}

export interface TtmLinkStore {
    get URL(): string;
}

export interface TotalStore {
    get Total(): bigint;
}

export interface IFeeSelectStore{
    patch(diff: Pick<Transfer, "fee">): void;
    Transfer: Pick<Transfer, "fee">;
    Fees: Record<Transfer["fee"], {
        fee: bigint;
        timePercs: [number, number, number]
    }>
}