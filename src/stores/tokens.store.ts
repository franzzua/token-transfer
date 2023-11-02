import {parseUnits} from "ethers/lib/utils";
import {TransferApi} from "../services/transfer.api";
import {UserStorage} from "../services/userStorage";
import {AccountService} from "../services/accountService";
import {cell, Cell, Inject} from "@cmmn/cell/lib";
import uniswapTokenList from "@uniswap/default-token-list";
import {chains} from "eth-chains/dist/src/chains.js";

const allTokens = uniswapTokenList.tokens as Array<TokenInfo & {
    logoURI: string;
}>

export class TokensStore {
    constructor(@Inject(UserStorage) private storage: UserStorage,
                @Inject(AccountService) private accountStore: AccountService,
                @Inject(TransferApi) private api: TransferApi) {

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

    async getTokenInfo(tokenAddress: string, chainId: number = this.accountStore.chainId): Promise<TokenInfo | null> {
        if (!tokenAddress){
            const native = chains[chainId].nativeCurrency;
            return  {
                ...native,
                address: null,
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
            }).catch((e) => {
                console.error(e);
                return null;
            });
    }

    async getTokenImageURL(address: string | null): Promise<string>{
        if (!address){
            return `https://s2.googleusercontent.com/s2/favicons?domain_url=${this.chain.infoURL}`;
        }
        return allTokens.find(x => x.address === address)?.logoURI;
    }

    public async parseTokenAmount(tokenAddress: string, amount: string){
        const info = await this.getTokenInfo(tokenAddress);
        if (!info) return null;
        const truncate = truncateUpTo18DigitsAfterDot(amount.replace(",","."))?.[0];
        try {
            return parseUnits(truncate, info.decimals).toBigInt();
        }catch (e){
            return null;
        }
    }
}

function truncateUpTo18DigitsAfterDot(number: string) {
    return number.match(/^(\d*([.,]\d{0,18})?)/g);
}