import {FunctionComponent} from "preact";
import {useCell} from "../../helpers/use-cell";
import {TransferStore} from "../../stores/transfer.store";
import {useTransferStore} from "../contexts/useTransferStore";

export const MyBalance: FunctionComponent = () => {
    const transferStore = useTransferStore<TransferStore>();
    const balance = useCell(() => transferStore.myBalanceFormatted);
    if (balance == null)
        return <>Loading balance...</>
    return <span>Balance: {balance}</span>;
}