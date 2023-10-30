import {FC, useContext, useMemo} from "react";
import {useCell} from "../../helpers/use-cell";
import {AppContext} from "../contexts/app-context";

export const SentTransfer: FC<{id: string}> = ({id}) => {
    const appContext = useContext(AppContext);
    const store = useMemo(() => appContext.getTransferSentStore(id), [id]);
    const {
        transfer, amount, tokenInfo, fee, isFeeChanged
    } = useCell(store.Info);
    return <div className="frost-card small">
        <div flex="column">
            <div>From {transfer.from}</div>
            <div>To {transfer.to}</div>
            <div>Amount {amount} {tokenInfo?.symbol}</div>
            <div>State {transfer.state}</div>
            <div>Fee {fee} {isFeeChanged ? '*changed*': ''}</div>
        </div>
    </div>

}


