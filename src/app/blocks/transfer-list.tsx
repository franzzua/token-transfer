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
        {notSentTransfers.length > 0 && <h3>Active transactions:</h3>}
        {notSentTransfers.map(x => <NotSentTransfer key={x._id} id={x._id}/>)}
        {sentTransfers.length > 0 && <h3>Sent transactions:</h3>}
        {sentTransfers.orderBy(x => -x.timestamp).map(x => <SentTransfer key={x._id} id={x._id}/>)}
    </div>
}