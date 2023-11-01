import {FunctionComponent} from "preact";
import {useMemo} from "preact/hooks";
import {useCell} from "../helpers/use-cell";
import {useAppContext} from "../contexts";
import {goTo} from "../routing";
import style from "./sent-transfer.module.css";

export const NotSentTransfer: FunctionComponent<{ id: string }> = ({id}) => {
    const appContext = useAppContext()
    const store = useMemo(() => appContext.getTransferStore(id), [id]);
    const {
        to, amount
    } = useCell(() => store.Transfer);
    const tokenInfo = useCell(store.TokenInfo)
    return <div className={`bg-yellow ${style.sentTransfer}`}>
        <div flex="column" gap="1">
            <div flex="row" justify="between">
                <div>
                    <span className="text-lg">{amount}</span>
                    <span className="text-sm"> {tokenInfo?.symbol}</span>
                </div>
            </div>
            {to && <div className={style.address}>
                <div><span>To</span> <a>{to}</a></div>
            </div>}
            <div flex="row" align="center" justify="between">
                <button className="text" onClick={() => appContext.storage.transfers.remove(id)}>Remove</button>
                <button className="text primary" onClick={() => goTo('/transfer', {id})}>Edit</button>
            </div>
        </div>
    </div>

}