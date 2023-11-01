import {FunctionComponent} from "preact";
import {useMemo} from "preact/hooks";
import {useCell} from "../helpers/use-cell";
import {useAppContext} from "../contexts";
import {AppContext} from "../contexts/app-context";
import {goTo} from "../routing";

export const NotSentTransfer: FunctionComponent<{ id: string }> = ({id}) => {
    const appContext = useAppContext()
    const store = useMemo(() => appContext.getTransferStore(id), [id]);
    const {
        to, amount
    } = useCell(() => store.Transfer);
    const tokenInfo = useCell(store.TokenInfo)
    return <div style={{padding: '1em', margin: '1em', borderRadius: '8px'}} className="bg-yello2w">
        <div flex="column" gap="1">
            <div>To {to}</div>
            <div>Amount {amount} {amount && tokenInfo?.symbol}</div>
            <div flex="row" align="center" justify="between">
                <button onClick={() => appContext.storage.transfers.remove(id)}>Remove</button>
                <button className="primary" onClick={() => goTo('/transfer', {id})}>Edit</button>
            </div>
        </div>
    </div>

}