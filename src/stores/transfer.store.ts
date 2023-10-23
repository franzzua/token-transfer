import {bind,compare, Container, Fn} from "@cmmn/cell/lib";
import {AsyncCell, Cell, cell} from "@cmmn/cell/lib";
import {Timer} from "../helpers/timer";
import {getTokenByAddress} from "../services/token.info";
import {TransferApi} from "../services/transfer.api";
import {TransfersStore} from "./transfers.store";
import {formatEther} from "ethers";

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
           ...this.Transfer, ...diff
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
        return formatEther(balance);
    });

    @cell({compare})
    public get TokenInfo(){
        return getTokenByAddress(this.Transfer.tokenAddress);
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