import {Cell, cell} from "@cmmn/cell/lib";

export class AccountStore {
    private provider = globalThis.ethereum;
    @cell
    public accounts: string[] = [];

    @cell({
        onExternal: e => localStorage.setItem(selectedAccountKey, e)
    })
    public me: string = localStorage.getItem(selectedAccountKey);

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
        Cell.OnChange(() => this.accounts, x => {
            if (this.me) {
                if (!x.value.includes(this.me))
                    this.me = x.value[0];
            } else {
                this.me = this.accounts[0];
            }
        })
    }

}

const selectedAccountKey = 'selectedAccount';