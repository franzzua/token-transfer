import {FC, useContext, useMemo} from "react";
import {useCell} from "../../helpers/use-cell";
import {AppContext} from "../contexts/app-context";

export const NotSentTransfer: FC<{ id: string }> = ({id}) => {
    const appContext = useContext(AppContext);
    const store = useMemo(() => appContext.getTransferStore(id), [id]);
    const {
        to, amount
    } = useCell(() => store.Transfer);
    const tokenInfo = useCell(store.TokenInfo)
    return <div className="frost-card small">
        <div flex="column">
            <div>To {to}</div>
            <div>Amount {amount} {tokenInfo?.symbol}</div>
        </div>
    </div>

}