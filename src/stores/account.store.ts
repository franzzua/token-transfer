import {cell} from "@cmmn/cell";

const provider = window.ethereum;
export class AccountStore {
    @cell
    public accounts: string[] = [];

    @cell
    public chainId: number = Number.parseInt(provider.chainId, 16);

    constructor() {
        provider.request({method: "eth_accounts"})
            .then(x => this.accounts = x as string[])
            .catch(console.error);
        provider.addListener('accountsChanged', (accounts: string[]) => {
            this.accounts = accounts;
        });
        provider.addListener('chainChanged', (accounts: string[]) => {
            this.chainId = Number.parseInt(provider.chainId, 16);
        });
    }

}