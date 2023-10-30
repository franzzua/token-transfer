import {useContext} from "react";
import {useCell} from "../../helpers/use-cell";
import {NotSentTransfer} from "../components/not-sent-transfer";
import {AppContext} from "../contexts/app-context";
import {SentTransfer} from "../components/sent-transfer";

export const TransferList = () => {
    const appStore = useContext(AppContext);
    const sentTransfers = useCell(() => appStore.SentTransfers);
    const notSentTransfers = useCell(() => appStore.NotSentTransfers);

    return <div flex="column" gap="2">
        {notSentTransfers.map(x => <NotSentTransfer key={x._id} id={x._id}/>)}
        {sentTransfers.map(x => <SentTransfer key={x._id} id={x._id}/>)}
    </div>
}