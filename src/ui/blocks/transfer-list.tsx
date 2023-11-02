import {useCell} from "../helpers/use-cell";
import {NotSentTransfer} from "../components/not-sent-transfer";
import {useAppContext} from "../contexts";
import {SentTransfer} from "../components/sent-transfer";

export const TransferList = () => {
    const appStore = useAppContext()
    const sentTransfers = useCell(() => appStore.SentTransfers);
    const notSentTransfers = useCell(() => appStore.NotSentTransfers);

    return <div flex="column" gap="2">
        {notSentTransfers.length > 0 && <div className="frost-card small" flex="column" gap="1">
            <h3>In progress:</h3>
            {notSentTransfers.map(x => <NotSentTransfer key={x._id} id={x._id}/>)}
        </div>}
        {sentTransfers.length > 0 && <div className="frost-card small" flex="column" gap="1">
            <h3>Sent transfers:</h3>
            {sentTransfers.orderBy(x => -x.timestamp).map(x => <SentTransfer key={x._id} id={x._id}/>)}
        </div>}
    </div>
}