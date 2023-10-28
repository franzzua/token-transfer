import {AsyncCell, bind, Cell, cell, compare, Fn} from "@cmmn/cell/lib";
import {Timer} from "../helpers/timer";
import {TransferApi} from "../services/transfer.api";
import {AccountStore} from "./account.store";
import {ChainStore} from "./chain.store";
import {formatUnits, parseUnits, isAddress, FeeData} from "ethers";
import {UserStorage} from "../services/userStorage";
import {BaseTransferStore} from "./base.transfer.store";

export class TransferStore extends BaseTransferStore {
    constructor(
        private id: string,
        private storage: UserStorage,
        private accountStore: AccountStore,
        api: TransferApi,
        private chainStore: ChainStore
    ) {
        super(api)
    }


    @cell({compare})
    public get Transfer(): Transfer{
        return this.storage.transfers.get(this.id);
    }

    public async patch(diff: Partial<Transfer>){
        await this.storage.transfers.addOrUpdate({
           ...this.Transfer, ...diff
        });
    }

    @bind
    async send() {
        for await (let t of this.api.run(this.Transfer)){
            await this.patch({
                state: t.state
            });
        }
    }

    private timer = new Timer(5000);
    public myBalance = new AsyncCell(async () => {
        this.timer.get();
        if (!this.Transfer.tokenAddress)
            return null;
        return await this.api.getBalance(this.Transfer.tokenAddress, this.accountStore.me)
            .catch(() => null);
    });

    public get myBalanceFormatted(){
        if (!this.TokenInfo.get() || this.myBalance.get() == null)
            return null;
        return formatUnits(this.myBalance.get(), this.TokenInfo.get().decimals);
    }


    public get Amount(){
        if (!this.TokenInfo.get()) return '';
        return formatUnits(this.Transfer.amount, this.TokenInfo.get().decimals);
    }
    public set Amount(amount: string){
        if (!this.TokenInfo.get()) return;
        this.patch({amount: parseUnits(amount, this.TokenInfo.get().decimals )});
    }
    public Gas = new AsyncCell(() => {
        if (!this.isValid) return null;
        return this.api.estimateGas(
            this.Transfer.tokenAddress,
            this.Transfer.to,
            this.Transfer.amount,
            this.accountStore.me
        ).catch(console.error);
    });

    public Fee = new Cell(() => {
        if (this.errors.tokenAddress) return null;
        if (this.errors.to) return null;
        const gas = this.Gas.get();
        if (!gas) return null;
        const gasData = this.chainStore.gasPrices;
        if (!gasData) return null;
        const fees = {
            slow: gasData.slow * gas,
            average: gasData.average * gas,
            fast: gasData.fast * gas,
        }
        return fees;
    });


    private validators: Partial<Record<keyof Transfer, (value, transfer: Transfer) => boolean>> = {
        to: isAddress,
        tokenAddress: isAddress,
        amount: (amount, transfer) => {
            const balance = this.myBalance.get();
            if (!balance) return true;
            // if (!transfer.fee) return true;
            return transfer.amount < balance;
        }
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