import {FC, useContext, useMemo} from "react";
import {useCell} from "../../helpers/use-cell";
import {AppContext} from "../contexts/app-context";
import {goTo} from "../routing";

export const NotSentTransfer: FC<{ id: string }> = ({id}) => {
    const appContext = useContext(AppContext);
    const store = useMemo(() => appContext.getTransferStore(id), [id]);
    const {
        to, amount
    } = useCell(() => store.Transfer);
    const tokenInfo = useCell(store.TokenInfo)
    return <div className="frost-card small">
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