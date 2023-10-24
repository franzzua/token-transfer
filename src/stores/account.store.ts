import {cell, AsyncCell} from "@cmmn/cell/lib";
import {Timer} from "../helpers/timer";
import {TransferApi} from "../services/transfer.api";

export class AccountStore {
    private provider = globalThis.ethereum;
    @cell
    public accounts: string[] = [];

    @cell
    public chainId: number = Number.parseInt(this.provider.chainId, 16);

    constructor() {
        this.provider.request({method: "eth_accounts"})
            .then(x => this.accounts = x as string[])
            .catch(console.error);
        this.provider.addListener('accountsChanged', (accounts: string[]) => {
            this.accounts = accounts;
        });
        this.provider.addListener('chainChanged', (accounts: string[]) => {
            this.chainId = Number.parseInt(this.provider.chainId, 16);
        });
    }

}