import {bind, Cell, cell, Fn} from "@cmmn/cell/lib";
import {ObservableDB} from "../services/observableDB";

class TransactionStore{

    @cell
    private db = new ObservableDB<Transaction>("transactions");

    public Transactions = new Cell(() => this.db.toArray());

    @bind
    add() {
        return this.db.addOrUpdate({
            _id: Fn.ulid(),
            amount: BigInt(Math.round(Math.random()*(10**8))),
            token: 'ETH',
            from: 'me',
            to: 'dad',
            state: 'pending'
        });
    }
}

export const transactionStore = new TransactionStore();

export type Transaction = {
    _id: string;
    amount: bigint;
    token: string;
    from: string;
    to: string;
    state: string;
}