import {FC, useContext, useMemo} from "react";
import {IdInjectionToken} from "../../container";
import {useCell} from "../../helpers/use-cell";
import {TransferStore} from "../../stores/transfer.store";
import {AppContext} from "../contexts/app-context";
import {goTo} from "../routing";

export const TransferListItem: FC<{id: string}> = ({id}) => {
    const appContext = useContext(AppContext);
    const store = useMemo(() => appContext.getTransferSentStore(id), [id]);
    const {
        transfer, amount, tokenInfo, actualState, actualFee, isFeeChanged
    } = useCell(store.Info);

    return <div onClick={() => goTo(['transfer'], {id})} className="frost-card small">
        <div flex="column">
            <div>From {transfer.from}</div>
            <div>To {transfer.to}</div>
            <div>Amount {amount} {tokenInfo?.symbol}</div>
            <div>State {actualState}</div>
            <div>Fee {actualFee} {isFeeChanged ? '*changed*': ''}</div>
        </div>
    </div>
}