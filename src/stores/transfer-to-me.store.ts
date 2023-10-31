import {pack, unpack} from "msgpackr";
import {bind, cell, compare, Fn} from "@cmmn/cell/lib";
import {TransferApi} from "../services/transfer.api";
import {formatUnits, parseUnits, isAddress, FeeData} from "ethers";
import {decode, encode} from "@urlpack/base62";
import {AccountStore} from "./account.store";
import {BaseTransferStore} from "./base.transfer.store";
import {ChainStore} from "./chain.store";
import {TokensStore} from "./tokens.store";

export class TransferToMeStore extends BaseTransferStore {
    constructor(api: TransferApi,
                private accountStore: AccountStore,
                tokensStore: TokensStore) {
        super(api, tokensStore);
    }

    @cell
    private transfer: Transfer = {
        _id: Fn.ulid(),
        fee: 'average',
        amount: null,
        tokenAddress: null,
        to: null,
    }

    @cell({compare})
    public get Transfer(): Transfer{
        return this.transfer;
    }

    public patch(diff: Partial<Transfer>){
        this.transfer = {
           ...this.transfer, ...diff
        };
    }

    @bind
    async send() {
    }

    public get errors(): Record<keyof Transfer, string | undefined>{
        const errors = {} as Record<keyof Transfer, string | undefined>;
        if (!isAddress(this.Transfer.to)){
            errors.to = `Invalid address`;
        }
        if (!isAddress(this.Transfer.tokenAddress)){
            errors.tokenAddress = `Invalid address`;
        }
        return errors;
    }

    public get URL(){
        if (!this.Amount)
            return null;
        const encoded = pack([
            this.accountStore.me,
            this.transfer.tokenAddress,
            this.transfer.amount
        ]);
        const str = encode(encoded);
        return `${location.origin}/ttm/${str}`;
    }

    parse(encoded: string) {
        const buffer = decode(encoded)
        const [to, tokenAddress, amount] = unpack(buffer);
        this.patch({
            to, tokenAddress, amount
        })
        return this.transfer;
    }


}