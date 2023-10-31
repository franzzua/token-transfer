import {useCell} from "../../helpers/use-cell";
import {NotSentTransfer} from "../components/not-sent-transfer";
import {useAppContext} from "../contexts";
import {SentTransfer} from "../components/sent-transfer";

export const TransferList = () => {
    const appStore = useAppContext()
    const sentTransfers = useCell(() => appStore.SentTransfers);
    const notSentTransfers = useCell(() => appStore.NotSentTransfers);

    return <div flex="column" gap="2">
        {notSentTransfers && <div className="frost-card small" flex="column">
        <h3>Saved transfers:</h3>
        {notSentTransfers.map((x,i) => <div key={x._id}>
            {i > 0 && <div className="divider"/>}
            <NotSentTransfer key={x._id} id={x._id}/>
        </div>)}
        </div>}
        {sentTransfers && <div className="frost-card small" flex="column">
            <h3>Sent transfers:</h3>
            {sentTransfers.orderBy(x => -x.timestamp).map((x,i) => <div key={x._id}>
                {i > 0 && <div className="divider"/>}
                <SentTransfer key={x._id} id={x._id}/>
            </div>)}
        </div>}
    </div>
}