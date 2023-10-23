import {bind, Cell, cell, compare, Fn} from "@cmmn/cell/lib";
import {TransferApi} from "../services/transfer.api";
import {TransferStorage} from "../services/transfer.storage";

export class TransferStore {

    constructor(storage: TransferStorage,
                private api: TransferApi) {
        this.storage = storage;
        this.init();
    }

    async init(){
        await this.storage.init();
        if (!this.currentTransfer){
            const transfer = {
                _id: Fn.ulid(),
                id: null,
                amount: BigInt(Math.round(Math.random()*(10**8))),
                tokenAddress: 'ETH',
                from: 'me',
                to: 'dad',
                state: 'initial'
            } as Transfer;
            await this.storage.addOrUpdate(transfer)
        }
    }

    @cell
    private storage: TransferStorage;

    @cell({compare})
    public get Transfers(){
        return this.storage.toArray();
    }

    @cell
    public get currentTransfer(){
        return this.Transfers.find(x => x.state == 'initial');
    }

    public async patchTransfer(diff: Pick<Transfer, "_id"> & Partial<Transfer>){
        const transfer = this.storage.get(diff._id);
        await this.storage.addOrUpdate({
            ...transfer,
            ...diff
        });
    }

    @bind
    async add() {
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