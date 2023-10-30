import {bind, cell, compare, Fn} from "@cmmn/cell/lib";
import {Container} from "@cmmn/cell/lib";
import {UserStorage} from "../services/userStorage";
import {TransferApi} from "../services/transfer.api";
import {AccountStore} from "./account.store";
import {ChainStore} from "./chain.store";
import {TransferToMeStore} from "./transfer-to-me.store";
import {TokensStore} from "./tokens.store";
import {TransferStore} from "./transfer.store";
import {SentTransferStore} from "./sent-transfer.store";

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
    @bind
    public getTransferStore(id: string){
        return new TransferStore(id, this.storage, this.accountStore, this.tokensStore, this.api, this.chainStore);
    }
    @bind
    getTransferSentStore(id: string) {
        return new SentTransferStore(id, this.storage, this.accountStore, this.tokensStore, this.api, this.chainStore);
    }

    @cell({compare})
    public get Transfers(){
        return this.storage.sentTransfers.toArray();
    }

    get(id: string) {
        return this.Transfers.find(x => x._id == id);
    }

    async createNew() {
        const transfer = {
            _id: Fn.ulid(),
            id: null,
            amount: null,
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