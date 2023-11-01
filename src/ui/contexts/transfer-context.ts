import {createContext} from "preact";
import {BaseTransferStore} from "../../stores/base.transfer.store";

export const TransferContext = createContext<BaseTransferStore>(null);
