import {Container} from "@cmmn/cell/lib";
import {UserStorage} from "../services/userStorage";
import {TransferApi} from "../services/transfer.api";
import {AccountStore} from "./account.store";
import {ChainStore} from "./chain.store";
import {TransfersStore} from "./transfers.store";

export class AppStore {
    constructor(public transfersStore: TransfersStore,
                public transferStorage: UserStorage,
                public transferApi: TransferApi,
                public accountStore: AccountStore,
                public chainStore: ChainStore,
                public container: Container) {
    }

    public getTransferStore(){

    }
}