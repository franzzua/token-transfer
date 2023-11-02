import {bind, cell, compare, Container, Inject, Injectable} from "@cmmn/cell/lib";
import {IdInjectionToken} from "../container";
import {UserStorage} from "../services/userStorage";
import {TransferApi} from "../services/transfer.api";
import {AccountService} from "../services/accountService";
import {ChainStore} from "./chain.store";
import {TransferToMeStore} from "./transfer-to-me.store";
import {TokensStore} from "./tokens.store";
import {TransferStore} from "./transfer.store";
import {SentTransferStore} from "./sent-transfer.store";
import {id} from "../helpers/id";

@Injectable()
export class AppStore {
    constructor(@Inject(UserStorage) public storage: UserStorage,
                @Inject(AccountService) public accountStore: AccountService,
                @Inject(ChainStore) public chainStore: ChainStore,
                @Inject(TokensStore) public tokensStore: TokensStore,
                @Inject(Container) public container: Container) {
    }

    @bind
    public getTransferToMeStore(){
        return this.container.get<TransferToMeStore>(TransferToMeStore);
    }
    @bind
    public getTransferStore(id: string){
        return this.container.get<TransferStore>(TransferStore, [
            {provide: IdInjectionToken, useValue: id},
        ]);
    }
    @bind
    getTransferSentStore(id: string) {
        return this.container.get<SentTransferStore>(SentTransferStore, [
            {provide: IdInjectionToken, useValue: id},
        ]);
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
            _id: id(),
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
        transfer._id = id();
        await this.storage.transfers.addOrUpdate(transfer);
        return transfer._id;
    }

}

