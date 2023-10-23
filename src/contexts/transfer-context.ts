import {createContext} from "react";
import {TransferStore} from "../stores/transfer.store";

export const TransferContext = createContext<TransferStore>(null);
