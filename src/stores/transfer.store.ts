import {AsyncCell, bind, Cell, cell, compare} from "@cmmn/cell/lib";
import {Timer} from "../helpers/timer";
import {getTokenByAddress} from "../services/token.info";
import {TransferApi} from "../services/transfer.api";
import {Transfer, TransfersStore} from "./transfers.store";
import {formatEther, formatUnits, parseUnits} from "ethers";
import {Storage} from "../services/storage";

export class TransferStore {
    constructor(private transfers: TransfersStore,
                private storage: Storage,
                private api: TransferApi,
                private id: string) {
    }


    @cell({compare})
    public get Transfer(){
        return this.transfers.get(this.id)
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
    public MyBalance = new AsyncCell(async () => {
        this.timer.get();
        if (!this.Transfer.tokenAddress || !this.Transfer.from)
            return null;
        const balance = await this.api.getBalance(this.Transfer.tokenAddress, this.Transfer.from);
        return formatUnits(balance, this.TokenInfo.decimals);
    });

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


    public Gas = new AsyncCell(() => this.api.estimateGas(this.Transfer));

    public Fee = new Cell(() => {
        const gas = this.Gas.get();
        const feeData = this.transfers.FeeData.get();
        if (!feeData || !gas) return null;
        return `${formatEther(feeData.gasPrice * gas)}, ${feeData.maxFeePerGas}, ${feeData.maxPriorityFeePerGas}, ${feeData.gasPrice}`;
    })
}
