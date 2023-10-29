import {FC} from "react";
import {useCell} from "../../helpers/use-cell";
import {TransferStore} from "../../stores/transfer.store";
import {useTransferStore} from "../contexts/useTransferStore";

export const MyBalance: FC = () => {
    const transferStore = useTransferStore<TransferStore>();
    const balance = useCell(() => transferStore.myBalanceFormatted);
    if (balance == null)
        return <></>
    return <span>Balance: {balance}</span>;
}