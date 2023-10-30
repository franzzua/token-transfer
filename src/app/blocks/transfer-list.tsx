import {useContext} from "react";
import {useCell} from "../../helpers/use-cell";
import {AppContext} from "../contexts/app-context";
import {SentTransfer} from "../components/sent-transfer";

export const TransferList = () => {
    const appStore = useContext(AppContext);
    const transfers = useCell(() => appStore.SentTransfers);

    return <div flex="column" gap="2">
        {transfers.map(x => <SentTransfer key={x._id} id={x._id}/>)}
    </div>
}