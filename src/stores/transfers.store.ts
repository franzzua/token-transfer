import {bind,compare, Container, Fn} from "@cmmn/cell/lib";
import {cell} from "@cmmn/cell/lib";
import {TransferApi} from "../services/transfer.api";
import {Storage} from "../services/storage";
import {TransferStore} from "./transfer.store";

export class TransfersStore {

    constructor(private storage: Storage,
                private api: TransferApi,
                private container: Container) {
    }


    @cell({compare})
    public get Transfers(){
        return this.storage.transfers.toArray();
    }

    @cell
    public get currentTransfer(){
        return this.Transfers.find(x => x.state == 'initial' || x.state == 'pending');
    }

    public async patchTransfer(transfer: Transfer){
        await this.storage.transfers.addOrUpdate(transfer);
    }

    get(id: string) {
        return this.Transfers.find(x => x._id == id);
    }

    getTransferStore(id: string){
        return new TransferStore(this, this.api, id);
    }

    async createNew() {
        const transfer = {
            _id: Fn.ulid(),
            id: null,
            amount: 0n,
            tokenAddress: '',
            from: null,
            to: null,
            state: 'initial'
        } as Transfer;
        await this.storage.transfers.addOrUpdate(transfer);
        return transfer._id;
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