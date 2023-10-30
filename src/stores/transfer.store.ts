import {AsyncCell, bind, Cell, cell, compare, Fn} from "@cmmn/cell/lib";
import {Timer} from "../helpers/timer";
import {TransferApi} from "../services/transfer.api";
import {AccountStore} from "./account.store";
import {ChainStore} from "./chain.store";
import {formatUnits, isAddress} from "ethers";
import {UserStorage} from "../services/userStorage";
import {BaseTransferStore} from "./base.transfer.store";
import {TokensStore} from "./tokens.store";

export class TransferStore extends BaseTransferStore {
    constructor(
        private id: string,
        private storage: UserStorage,
        private accountStore: AccountStore,
        tokensStore: TokensStore,
        api: TransferApi,
        private chainStore: ChainStore
    ) {
        super(api, tokensStore)
    }


    @cell({compare})
    public get Transfer(): Transfer{
        return this.storage.transfers.get(this.id) ?? ({} as any);
    }

    public async patch(diff: Partial<Transfer>){
        await this.storage.transfers.addOrUpdate({
           ...this.Transfer, ...diff
        });
    }

    @bind
    async send() {
        const fee = this.chainStore.gasPrices[this.Transfer.fee];
        const transferSent = await this.api.run(
            this.Transfer.tokenAddress, this.Transfer.to,
            this.Amount, fee.maxPriorityFeePerGas
        );
        await this.storage.sentTransfers.addOrUpdate(transferSent);
        await this.storage.transfers.remove(this.id);
    }

    private timer = new Timer(5000);
    public myBalance = new AsyncCell(async () => {
        this.timer.get();
        return await this.api.getBalance(this.Transfer.tokenAddress)
            .catch(() => null);
    });

    public get myBalanceFormatted(){
        if (!this.TokenInfo.get() || this.myBalance.get() == null)
            return null;
        return formatUnits(this.myBalance.get(), this.TokenInfo.get().decimals);
    }


    public Gas = new AsyncCell(() => {
        return this.api.estimateGas(
            this.Transfer.tokenAddress,
            this.accountStore.me,
            0n,
            this.accountStore.me
        ).catch(console.error);
    });

    public Fee = new Cell(() => {
        const gas = this.Gas.get();
        if (!gas) return null;
        const gasData = this.chainStore.gasPrices;
        if (!gasData) return null;
        const fees = {
            slow: {fee: gasData.slow.maxPriorityFeePerGas * gas, time: gasData.slow.time},
            average: {fee: gasData.average.maxPriorityFeePerGas * gas, time: gasData.average.time},
            fast: {fee: gasData.fast.maxPriorityFeePerGas * gas, time: gasData.fast.time},
        }
        return fees;
    });


    private validators: Partial<Record<keyof Transfer, (value, transfer: Transfer) => boolean>> = {
        to: isAddress,
        tokenAddress: x => !x || isAddress(x),
        amount: (amount, transfer) => {
            const balance = this.myBalance.get();
            if (balance == null) return true;
            if (!this.Total) return false;
            return this.Total <= balance;
        },
        fee: () => !!this.Fee.get()
    }
    public get Total(): bigint | null{
        if (!this.Amount) return null;
        const fees = this.Fee.get();
        const fee = fees?.[this.Transfer.fee]?.fee ?? 0n
        return this.Amount + fee;
    }

    public get isValid(){
        for (let key in this.validators) {
            if (!this.validators[key](this.Transfer[key], this.Transfer)){
                return false;
            }
        }
        return true;
    }
    public get errors(): Record<keyof Transfer, string | undefined>{
        const errors = {} as Record<keyof Transfer, string | undefined>;
        for (let key in this.validators) {
            if (!this.validators[key](this.Transfer[key], this.Transfer)){
                errors[key] = "error";
            }
        }
        return errors;
    }

}