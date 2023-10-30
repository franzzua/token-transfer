import {TransferApi} from "../services/transfer.api";
import {UserStorage} from "../services/userStorage";
import {AccountStore} from "./account.store";
import {cell, Cell} from "@cmmn/cell/lib";
import uniswapTokenList from "@uniswap/default-token-list";
import {chains} from "eth-chains/dist/src/chains.js";

const allTokens = uniswapTokenList.tokens as Array<TokenInfo & {
    logoURI: string;
}>

export class TokensStore {
    constructor(private storage: UserStorage,
                private accountStore: AccountStore,
                private api: TransferApi) {

    }

    get chain(){
        return chains[this.accountStore.chainId];
    }

    @cell
    get savedTokens(): TokenInfo[]{
        return [
            this.defaultToken.get(),
            ...this.storage.tokens.toArray().map(x => ({
                address: x._id,
                ...x
            })).filter(x =>
                x.chainId == this.accountStore.chainId
            )
        ];
    }

    @cell
    get tokens(): TokenInfo[]{
        return [
            ...this.savedTokens,
            ...allTokens.filter(x =>
                x.chainId == this.accountStore.chainId
            )
        ];
    }

    public defaultToken = new Cell(() => this.chain.nativeCurrency as TokenInfo);



    public get Tokens() {
        return this.storage.tokens;
    }

    public get Balances(){
        return this.savedTokens.map(x => ({
            token: x.address,
            amount: this.api.getBalance(x.address)
        }))
    }

    async getTokenInfo(tokenAddress: string, chainId: number = this.accountStore.chainId): Promise<TokenInfo> {
        if (!tokenAddress){
            const native = chains[chainId].nativeCurrency;
            return  {
                ...native,
                address: '',
                chainId,
            }
        }
        return  allTokens.find(x => x.address == tokenAddress) ??
            await this.api.getTokenInfo(tokenAddress, chainId).then(info => {
                if (info) {
                    this.storage.tokens.addOrUpdate({
                        _id: tokenAddress,
                        chainId,
                        ...info,
                    })
                }
                return info;
            }).catch(() => undefined);
    }

    async getTokenImageURL(address: string | null): Promise<string>{
        return allTokens.find(x => x.address === address)?.logoURI;
    }
}