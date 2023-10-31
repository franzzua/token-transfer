import {bind, cell, compare, Fn, Inject, Injectable} from "@cmmn/cell/lib";
import {Container} from "@cmmn/cell/lib";
import {UserStorage} from "../services/userStorage";
import {TransferApi} from "../services/transfer.api";
import {AccountStore} from "./account.store";
import {ChainStore} from "./chain.store";
import {TransferToMeStore} from "./transfer-to-me.store";
import {TokensStore} from "./tokens.store";
import {TransferStore} from "./transfer.store";
import {SentTransferStore} from "./sent-transfer.store";

@Injectable()
export class AppStore {
    constructor(@Inject(UserStorage) public storage: UserStorage,
                @Inject(TransferApi) public api: TransferApi,
                @Inject(AccountStore) public accountStore: AccountStore,
                @Inject(ChainStore) public chainStore: ChainStore,
                @Inject(TokensStore) public tokensStore: TokensStore,
                @Inject(Container) public container: Container) {
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
    public get NotSentTransfers(){
        return this.storage.transfers.toArray();
    }
    @cell({compare})
    public get SentTransfers(){
        return this.storage.sentTransfers.toArray();
    }

    get(id: string) {
        return this.SentTransfers.find(x => x._id == id);
    }

    async createNew() {
        const transfer = {
            _id: Fn.ulid(),
            amount: null,
            tokenAddress: '',
            to: null,
            fee: 'average',
            state: 'initial',
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