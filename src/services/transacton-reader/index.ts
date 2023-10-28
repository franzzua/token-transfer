import {TransactionReader} from "./transaction.reader";
import {TransactionReaderWrapper} from "./transaction.reader.wrapper";

export const transactionReader:{
    start(): void;
    stop(): void;
} = globalThis.DEBUG ? new TransactionReader() : new TransactionReaderWrapper();