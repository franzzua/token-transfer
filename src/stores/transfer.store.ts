import {AsyncCell, bind, cell, compare, Inject, Injectable} from "@cmmn/cell/lib";
import {IdInjectionToken} from "../container";
import {Timer} from "../helpers/timer";
import {TransferApi} from "../services/transfer.api";
import {AccountService} from "../services/accountService";
import {ChainStore} from "./chain.store";
import {formatUnits} from "ethers/utils";
import {isAddress} from "ethers/address";
import {UserStorage} from "../services/userStorage";
import {BaseTransferStore} from "./base.transfer.store";
import {AmountInputStore, IFeeSelectStore, TotalStore} from "./interfaces";
import {TokensStore} from "./tokens.store";

@Injectable(true)
export class TransferStore extends BaseTransferStore
    implements IFeeSelectStore, AmountInputStore, TotalStore{
    constructor(
        @Inject(IdInjectionToken) private id: string,
        @Inject(UserStorage) private storage: UserStorage,
        @Inject(AccountService) private accountStore: AccountService,
        @Inject(TokensStore) tokensStore: TokensStore,
        @Inject(TransferApi) private api: TransferApi,
        @Inject(ChainStore) private chainStore: ChainStore
    ) {
        super(tokensStore)
    }


    public isNotExists = new AsyncCell(async () => {
        await this.storage.transfers.isLoaded;
        return !this.storage.transfers.get(this.id);
    });

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
        const fee = this.chainStore.gasPrices[this.Transfer.fee];
        const transferSent = await this.api.run(
            this.Transfer.tokenAddress, this.Transfer.to,
            this.Amount.get(), fee.maxPriorityFeePerGas
        );
        await this.storage.sentTransfers.addOrUpdate(transferSent);
        await this.storage.transfers.remove(this.id);
    }

    private timer = new Timer(5000);
    public myBalance = new AsyncCell(async () => {
        if (!this.Transfer) return null;
        this.timer.get();
        return await this.api.getBalance(this.Transfer.tokenAddress)
            .catch(() => null);
    });

    public get balance(){
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

    public get Fees(){
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
    }


    private validators: Partial<Record<keyof Transfer, (value, transfer: Transfer) => string | null>> = {
        to: x => {
            if (!x)
                return 'Address is required';
            if (!isAddress(x))
                return 'Invalid address';
            if (x.toLowerCase() === this.accountStore.me.toLowerCase())
                return 'You can\'t transfer tokens to yourself';
            return null;
        },
        tokenAddress: x => (!x || isAddress(x)) ? null : 'Invalid address',
        amount: (amount, transfer) => {
            const balance = this.myBalance.get();
            if (balance == null) return null;
            if (!this.Transfer.amount) return `Amount is required`;
            if (Number.isNaN(+this.Transfer.amount)) return `Invalid number`;
            if (+this.Transfer.amount < 0) return `Amount should be positive number`;
            if (!this.Total) return null;
            return this.Total <= balance ? null : `Your have not sufficient tokens amount`;
        },
        fee: () => !!this.Fees ? null : `Wait for loading fees`
    }
    public get Total(): bigint | null{
        if (!this.Amount.get()) return null;
        const fees = this.Fees;
        const fee = fees?.[this.Transfer.fee]?.fee ?? 0n
        return this.Amount.get() + fee;
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