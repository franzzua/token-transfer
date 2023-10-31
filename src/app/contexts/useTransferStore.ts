import {useContext} from "preact/hooks";
import {BaseTransferStore} from "../../stores/base.transfer.store";
import {TransferContext} from "./transfer-context";

export function useTransferStore<TStore extends BaseTransferStore>(): TStore{
    return  useContext(TransferContext) as TStore;
}