import {pack, unpack} from "msgpackr";
import {bind, cell, compare, Fn} from "@cmmn/cell/lib";
import {getTokenByAddress} from "../services/token.info";
import {Transfer} from "./transfers.store";
import {formatUnits, parseUnits, isAddress, FeeData} from "ethers";
import {decode, encode} from "@urlpack/base62";
import {BaseTransferStore} from "./base.transfer.store";

export class TransferToMeStore implements BaseTransferStore {
    constructor() {
    }

    @cell
    private transfer: Transfer = {
        _id: Fn.ulid(),
        fee: 0n,
        amount: 0n,
        tokenAddress: null,
        from: null,
        state: 'initial',
        to: null,
        id: null
    }

    @cell({compare})
    public get Transfer(): Transfer{
        return this.transfer;
    }

    public async patch(diff: Partial<Transfer>){
        this.transfer = {
           ...this.transfer, ...diff
        };
    }

    @bind
    async send() {
    }
    @cell({compare})
    public get TokenInfo(){
        return getTokenByAddress(this.Transfer.tokenAddress);
    }

    public get Amount(){
        if (!this.TokenInfo) return '';
        return formatUnits(this.Transfer.amount, this.TokenInfo.decimals);
    }
    public set Amount(amount: string){
        this.patch({amount: parseUnits(amount, this.TokenInfo.decimals )});
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
        const encoded = pack([
            this.transfer.from,
            this.transfer.tokenAddress,
            this.Amount
        ]);
        const str = encode(encoded);
        return `${location.origin}/ttm/${str}`;
    }

    parse(encoded: string) {
        const buffer = decode(encoded)
        const [to, tokenAddress, amount] = unpack(buffer);
        this.patch({
            to, tokenAddress
        })
        this.Amount = amount;
        return this.transfer;
    }
}