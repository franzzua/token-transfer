import {bind, Cell, cell, compare, Fn} from "@cmmn/cell/lib";
import {TransferApi} from "../services/transfer.api";
import {TransferStorage} from "../services/transfer.storage";

export class TransactionStore{

    constructor(storage: TransferStorage,
                private api: TransferApi) {
        this.db = storage;
    }
    @cell
    private db: TransferStorage;

    public Transactions = new Cell(() => this.db.toArray(), {compare});

    @bind
    async add() {
        const transfer = {
            _id: Fn.ulid(),
            id: null,
            amount: BigInt(Math.round(Math.random()*(10**8))),
            tokenAddress: 'ETH',
            from: 'me',
            to: 'dad',
            state: 'pending'
        } as Transfer;
        await this.db.addOrUpdate(transfer);
        for await (let tr of this.api.run(transfer)){
            console.log(tr);
        }
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