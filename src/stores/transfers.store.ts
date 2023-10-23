import {bind, Cell, cell, compare, Container, Fn} from "@cmmn/cell/lib";
import {TransferApi} from "../services/transfer.api";
import {TransferStorage} from "../services/transfer.storage";
import {TransferStore} from "./transfer.store";

export class TransfersStore {

    constructor(storage: TransferStorage,
                private api: TransferApi,
                private container: Container) {
        this.storage = storage;
    }


    @cell
    private storage: TransferStorage;

    @cell({compare})
    public get Transfers(){
        return this.storage.toArray();
    }

    @cell
    public get currentTransfer(){
        return this.Transfers.find(x => x.state == 'initial' || x.state == 'pending');
    }

    public async patchTransfer(diff: Pick<Transfer, "_id"> & Partial<Transfer>){
        const transfer = this.storage.get(diff._id);
        await this.storage.addOrUpdate({
            ...transfer,
            ...diff
        });
    }

    @bind
    async send(transfer: Transfer) {
        await this.patchTransfer({
            ...transfer,
            state: 'pending'
        });
        for await (let t of this.api.run(transfer)){

        }
    }

    get(id: string) {
        return this.storage.get(id);
    }

    getTransferStore(id: string){
        return new TransferStore(this, this.api, id);
    }

    async createNew() {
        await this.storage.init();
        const transfer = {
            _id: Fn.ulid(),
            id: null,
            amount: BigInt(Math.round(Math.random()*(10**8))),
            tokenAddress: 'ETH',
            from: null,
            to: null,
            state: 'initial'
        } as Transfer;
        await this.storage.addOrUpdate(transfer)
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