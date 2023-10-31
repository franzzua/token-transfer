import {AsyncCell, bind, Cell, cell, compare, Fn} from "@cmmn/cell/lib";
import {Timer} from "../helpers/timer";
import {TransferApi} from "../services/transfer.api";
import {AccountStore} from "./account.store";
import {ChainStore} from "./chain.store";
import {formatUnits, toNumber} from "ethers/utils";
import {isAddress} from "ethers/address";
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
            slow: {fee: gasData.slow.maxPriorityFeePerGas * gas, ...gasData.slow},
            average: {fee: gasData.average.maxPriorityFeePerGas * gas, ...gasData.average},
            fast: {fee: gasData.fast.maxPriorityFeePerGas * gas, ...gasData.fast},
        }
        return fees;
    });


    private validators: Partial<Record<keyof Transfer, (value, transfer: Transfer) => string | null>> = {
        to: x => !isAddress(x) ? 'Invalid address' :
            x.toLowerCase() === this.accountStore.me.toLowerCase() ? 'You can\'t transfer tokens to yourself' : null,
        tokenAddress: x => (!x || isAddress(x)) ? null : 'Invalid address',
        amount: (amount, transfer) => {
            const balance = this.myBalance.get();
            if (balance == null) return null;
            if (Number.isNaN(+this.Transfer.amount)) return `Invalid number`;
            if (+this.Transfer.amount < 0) return `Amount should be positive number`;
            if (!this.Total) return null;
            return this.Total <= balance ? null : `Your have not sufficient tokens amount`;
        },
        fee: () => !!this.Fee.get() ? null : `Wait for loading fees`
    }
    public get Total(): bigint | null{
        if (!this.Amount) return null;
        const fees = this.Fee.get();
        const fee = fees?.[this.Transfer.fee]?.fee ?? 0n
        return this.Amount + fee;
    }

    public get isValid(){
        return Object.values(this.errors).every(x => !x);
    }
    public get errors(): Record<keyof Transfer, string | undefined>{
        const errors = {} as Record<keyof Transfer, string | undefined>;
        for (let key in this.validators) {
            errors[key] = this.validators[key](this.Transfer[key], this.Transfer);
        }
        return errors;
    }

    remove() {
        return this.storage.transfers.remove(this.id);
    }
}