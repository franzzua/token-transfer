import {TransferApi} from "../services/transfer.api";
import {UserStorage} from "../services/userStorage";
import {AccountStore} from "./account.store";
import {chains} from "eth-chains";
import {cell, Cell} from "@cmmn/cell/lib";
import uniswapTokenList from "@uniswap/default-token-list";
import {getTokenByAddress} from "../services/token.info";

const allTokens = uniswapTokenList.tokens as Array<TokenInfo>

export class TokensStore {
    constructor(private storage: UserStorage,
                private accountStore: AccountStore,
                private api: TransferApi) {

    }

    get chain(){
        return chains.get(this.accountStore.chainId);
    }

    @cell
    get tokens(): TokenInfo[]{
        return allTokens.filter(x =>
            x.chainId == this.accountStore.chainId
        );
    }

    public defaultToken = new Cell(() => this.chain.nativeCurrency);

    public get Tokens() {
        return this.storage.tokens;
    }

    public get Balances(){
        return
    }

    async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
        if (!tokenAddress){
            const native = this.defaultToken.get();
            return  {
                ...native,
                address: '',
                chainId: this.accountStore.chainId,
                logoURI: '',
            }
        }
        return getTokenByAddress(tokenAddress) ??
            await this.api.getTokenInfo(tokenAddress).catch(() => undefined);
    }
}