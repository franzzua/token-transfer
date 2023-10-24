import {createContext} from "react";
import {TransferStore} from "../../stores/transfer.store";
import {TransferToMeStore} from "../../stores/transfer-to-me.store";
import {BaseTransferStore} from "../../stores/base.transfer.store";

export const TransferContext = createContext<BaseTransferStore>(null);
