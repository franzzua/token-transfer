import {createContext} from "preact";
import {TransactionStore} from "../stores/transaction.store";

export const DiContext = createContext<DiContainer>(null);

export class DiContainer {
    constructor(public transactionStore: TransactionStore) {
    }
}