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
                @Inject(TransferApi) public api: TransferApi,
                @Inject(AccountService) public accountStore: AccountService,
                @Inject(ChainStore) public chainStore: ChainStore,
                @Inject(TokensStore) public tokensStore: TokensStore,
                @Inject(Container) public container: Container) {
        this.api.on('tx_replacement', async e => {
            const transfer = this.storage.sentTransfers.get(e.oldHash);
            await this.storage.sentTransfers.remove(e.oldHash);
            await this.storage.sentTransfers.addOrUpdate({
                ...transfer,
                state: 'mined',
                maxPriorityFeePerGas: e.newTransaction.maxPriorityFeePerGas,
                _id: e.newHash,
                timestamp: +new Date()/1000
            })
        });
        this.api.on('tx_cancelled', async e => {
            const transfer = this.storage.sentTransfers.get(e.oldHash);
            await this.storage.sentTransfers.addOrUpdate({
                ...transfer,
                state: 'rejected',
                timestamp: +new Date()/1000
            })
        });
        this.api.on('tx_mined', async e => {
            const transfer = this.storage.sentTransfers.get(e.hash);
            await this.storage.sentTransfers.addOrUpdate({
                ...transfer,
                state: 'mined',
                timestamp: +new Date()/1000
            })
        });
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

