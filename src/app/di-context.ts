import {createContext} from "preact";
import {TransferStore} from "../stores/transfer.store";
import {AccountStore} from "../stores/account.store";

export const DiContext = createContext<DiContainer>(null);

export class DiContainer {
    constructor(public transferStore: TransferStore,
                public accountStore: AccountStore) {
    }
}