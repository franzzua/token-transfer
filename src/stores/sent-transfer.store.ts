import {AsyncCell, bind, Cell, cell, compare, Fn} from "@cmmn/cell/lib";
import {TransferApi} from "../services/transfer.api";
import {AccountService} from "../services/accountService";
import {ChainStore} from "./chain.store";
import {formatUnits} from "ethers/utils";
import {UserStorage} from "../services/userStorage";
import {TokensStore} from "./tokens.store";
import {IFeeSelectStore} from "../ui/components/fee-select";
import {id} from "../helpers/id";

export class SentTransferStore
    implements IFeeSelectStore {
    constructor(
        private id: string,
        private storage: UserStorage,
        private accountStore: AccountService,
        private tokensStore: TokensStore,
        private api: TransferApi,
        private chainStore: ChainStore
    ) {
    }

    private fee = new Cell<Transfer['fee']>('average');
    @cell({compare})
    public get Transfer(){
        return {
            ...this.storage.sentTransfers.get(this.id),
            fee: this.fee.get()
        };
    }
    public patch(diff: Pick<Transfer, "fee">) {
        this.fee.set(diff.fee)
    }


    public TokenInfo = new AsyncCell<TokenInfo | undefined>(async () => {
        return this.tokensStore.getTokenInfo(this.Transfer.tokenAddress, this.Transfer.chainId)
    });

    public get Amount(){
        if (!this.TokenInfo.get()) return null;
        return  formatUnits(this.Transfer.amount, this.TokenInfo.get().decimals);
    }
    public get Fee(){
        if (!this.TokenInfo.get()) return null;
        return formatUnits(this.Transfer.maxPriorityFeePerGas, this.TokenInfo.get().decimals);
    }

    public Info = new Cell(() => ({
        transfer: this.Transfer,
        tokenInfo: this.TokenInfo.get(),
        amount: this.Amount,
        fee: this.Fee,
        isFeeChanged: this.Transfer.maxPriorityFeePerGas !== this.Transfer.initialMaxPriorityFeePerGas
    }), {compare});



    public Gas = new AsyncCell(() => {
        return this.api.estimateGas(
            this.Transfer.tokenAddress,
            this.Transfer.from,
            this.Transfer.amount,
            this.Transfer.to
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

    @bind
    public async replace(){
        if (this.Transfer.chainId !== this.accountStore.chainId){
            await this.accountStore.switchToChain(this.Transfer.chainId);
        }
        const maxPriorityFeePerGas = this.Fees[this.fee.get()].maxPriorityFeePerGas;
        return this.api.replace(this.id, this.Transfer.from, maxPriorityFeePerGas);
    }

    public async clone(){
        if (this.Transfer.chainId !== this.accountStore.chainId){
            await this.accountStore.switchToChain(this.Transfer.chainId);
        }
        const clone = {
            amount: this.Amount,
            to: this.Transfer.to,
            tokenAddress: this.Transfer.tokenAddress,
            fee: "average",
            _id: id()
        } as Transfer;
        await this.storage.transfers.addOrUpdate(clone);
        return clone._id;
    }
}