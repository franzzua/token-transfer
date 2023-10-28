import {compare, Fn} from "@cmmn/cell/lib";
import {cell} from "@cmmn/cell/lib";
import {TransferApi} from "../services/transfer.api";
import {UserStorage} from "../services/userStorage";
import {AccountStore} from "./account.store";

export class TransfersStore {

    constructor(private storage: UserStorage,
                private api: TransferApi,
                private account: AccountStore) {
    }


    @cell({compare})
    public get Transfers(){
        return this.storage.transfers.toArray();
    }

    @cell
    public get currentTransfer(){
        return this.Transfers.find(x => x.state == 'initial' || x.state == 'pending');
    }

    get(id: string) {
        return this.Transfers.find(x => x._id == id);
    }

    async createNew() {
        const transfer = {
            _id: Fn.ulid(),
            id: null,
            amount: 0n,
            tokenAddress: '',
            from: null,
            to: null,
            fee: 0n,
            state: 'initial'
        } as Transfer;
        await this.storage.transfers.addOrUpdate(transfer);
        return transfer._id;
    }

    async create(transfer: Transfer) {
        transfer._id = Fn.ulid();
        await this.storage.transfers.addOrUpdate(transfer);
        return transfer._id;
    }
}

export type Transfer = {
    _id: string;
    id: string | null;
    amount: bigint;
    tokenAddress: string;
    to: string;
    state: string;
    fee: bigint;
}