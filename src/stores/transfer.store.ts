import {AsyncCell, bind, cell, compare} from "@cmmn/cell/lib";
import {Timer} from "../helpers/timer";
import {getTokenByAddress} from "../services/token.info";
import {TransferApi} from "../services/transfer.api";
import {TransfersStore} from "./transfers.store";
import {formatUnits, parseUnits} from "ethers";

export class TransferStore {
    constructor(private transfers: TransfersStore,
                private api: TransferApi,
                private id: string) {
    }


    @cell({compare})
    public get Transfer(){
        return this.transfers.get(this.id)
    }

    public async patch(diff: Partial<Transfer>){
        await this.transfers.patchTransfer({
           _id: this.id, ...diff
        });
    }

    @bind
    async send() {
        await this.patch({
            state: 'pending'
        });
        for await (let t of this.api.run(this.Transfer)){

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
        return formatUnits(this.Transfer.amount, this.TokenInfo.decimals);
    }
    public set Amount(amount: string){
        this.patch({amount: parseUnits(amount, this.TokenInfo.decimals )});
    }
}

export type Transfer = {
    _id: string;
    id: string | null;
    amount: bigint;
    tokenAddress: string;
    from: string;
    to: string;
    state: string;
}