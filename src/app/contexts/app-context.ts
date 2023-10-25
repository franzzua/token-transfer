import {Container} from "@cmmn/cell/lib";
import {createContext} from "react";
import {TransferApi} from "../../services/transfer.api";
import {Storage} from "../../services/storage";
import {TransfersStore} from "../../stores/transfers.store";
import {AccountStore} from "../../stores/account.store";
import {ChainStore} from "../../stores/chain.store";

export const AppContext = createContext<DiContainer>(null);

export class DiContainer {
    constructor(public transfersStore: TransfersStore,
                public transferStorage: Storage,
                public transferApi: TransferApi,
                public accountStore: AccountStore,
                public chainStore: ChainStore,
                public container: Container) {
    }
}