import {bind, cell, compare, Fn} from "@cmmn/cell/lib";
import {Container} from "@cmmn/cell/lib";
import {UserStorage} from "../services/userStorage";
import {TransferApi} from "../services/transfer.api";
import {AccountStore} from "./account.store";
import {ChainStore} from "./chain.store";
import {TransferToMeStore} from "./transfer-to-me.store";
import {TokensStore} from "./tokens.store";

export class AppStore {
    constructor(public storage: UserStorage,
                public api: TransferApi,
                public accountStore: AccountStore,
                public chainStore: ChainStore,
                public tokensStore: TokensStore,
                public container: Container) {
    }

    @bind
    public getTransferToMeStore(){
        return new TransferToMeStore(this.api, this.accountStore, this.tokensStore);
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
            fee: 'average',
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