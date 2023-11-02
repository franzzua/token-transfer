import {pack, unpack} from "msgpackr";
import {bind, cell, compare, Fn, Inject, Injectable} from "@cmmn/cell/lib";
import {isAddress} from "ethers/address";
import {decode, encode} from "@urlpack/base62";
import {AccountService} from "../services/accountService";
import {BaseTransferStore} from "./base.transfer.store";
import {AmountInputStore, TtmLinkStore} from "./interfaces";
import {TokensStore} from "./tokens.store";

@Injectable(true)
export class TransferToMeStore extends BaseTransferStore
    implements TtmLinkStore, AmountInputStore{
    constructor(@Inject(AccountService) private accountService: AccountService,
                @Inject(AccountService) tokensStore: TokensStore) {
        super(tokensStore);
    }

    @cell
    private transfer: Pick<Transfer, "amount"|"tokenAddress"> = {
        amount: null,
        tokenAddress: null,
    }

    @cell({compare})
    public get Transfer(){
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
        if (!isAddress(this.Transfer.tokenAddress)){
            errors.tokenAddress = `Invalid address`;
        }
        return errors;
    }

    public get URL(){
        if (!this.Amount.get())
            return null;
        const encoded = pack([
            this.accountService.me,
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
        return {
            to, tokenAddress, amount
        };
    }


}