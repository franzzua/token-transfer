import {AsyncCell, bind, Cell, cell, compare, Fn} from "@cmmn/cell/lib";
import {Timer} from "../helpers/timer";
import {TransferApi} from "../services/transfer.api";
import {AccountStore} from "./account.store";
import {ChainStore} from "./chain.store";
import {formatUnits, parseUnits, isAddress, FeeData, formatEther} from "ethers";
import {UserStorage} from "../services/userStorage";
import {BaseTransferStore} from "./base.transfer.store";
import {TokensStore} from "./tokens.store";

export class SentTransferStore  {
    constructor(
        private id: string,
        private storage: UserStorage,
        private accountStore: AccountStore,
        private tokensStore: TokensStore,
        private api: TransferApi,
        private chainStore: ChainStore
    ) {
    }

    @cell({compare})
    public get Transfer(): TransferSent{
        return this.storage.sentTransfers.get(this.id);
    }
    public async patch(diff: Partial<TransferSent>) {
        await this.storage.sentTransfers.addOrUpdate({
            ...this.Transfer, ...diff
        });
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
        if (!this.ActualData.get()) return null;
        return  formatUnits(this.ActualData.get().fee, this.TokenInfo.get().decimals);
    }

    public Info = new Cell(() => ({
        transfer: this.Transfer,
        tokenInfo: this.TokenInfo.get(),
        amount: this.Amount,
        actualState: this.ActualData.get()?.state,
        actualFee: this.Fee,
        isFeeChanged: this.ActualData.get()?.fee != this.Transfer.fee
    }), {compare});


    private timer = new Timer(1000);
    public ActualData = new AsyncCell<Pick<TransferSent, 'state'|'fee'>>(async () => {
        switch (this.Transfer.state){
            case "mined":
            case "rejected":
                return {state: this.Transfer.state, fee: this.Transfer.fee};
        }
        return await this.api.getTransactionState(this.Transfer._id);
    });
}