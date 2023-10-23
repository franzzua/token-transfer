import {createContext} from "react";
import {TransferApi} from "../services/transfer.api";
import {TransferStorage} from "../services/transfer.storage";
import {TransfersStore} from "../stores/transfers.store";
import {AccountStore} from "../stores/account.store";

export const AppContext = createContext<DiContainer>(null);

export class DiContainer {
    constructor(public transfersStore: TransfersStore,
                public transferStorage: TransferStorage,
                public transferApi: TransferApi,
                public accountStore: AccountStore) {
    }
}