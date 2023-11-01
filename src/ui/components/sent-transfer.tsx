import {FunctionComponent} from "preact";
import {useCallback, useContext, useMemo} from "preact/hooks";
import {useCell} from "../helpers/use-cell";
import {AppContext} from "../contexts/app-context";
import {goTo} from "../routing";
import style from "./sent-transfer.module.css";

export const SentTransfer: FunctionComponent<{id: string}> = ({id}) => {
    const appContext = useContext(AppContext);
    const store = useMemo(() => appContext.getTransferSentStore(id), [id]);
    const {
        transfer, amount, tokenInfo, fee, isFeeChanged
    } = useCell(store.Info);
    const needToSwitchChainId = useCell(() => appContext.accountStore.chainId !== transfer.chainId);
    const chain = useMemo(() => appContext.chainStore.getChain(transfer.chainId), [transfer.chainId]);
    const sendAgain = useCallback(async () => {
        const id = await store.clone();
        goTo('/transfer', {id});
    }, [transfer, amount]);
    return <div className={[colors[transfer.state], style.sentTransfer].join(' ')}
                flex="column" gap="0.5">
        <div flex="row" justify="between">
            <div>
                <span className="text-lg">{amount}</span>
                <span className="text-sm"> {tokenInfo?.symbol}</span>
            </div>
            <div flex="column" align="end">
                <b>{transfer.state}</b>
                {isFeeChanged && <div className="text-xs">fee changed</div>}
                <div className="text-xs">{new Date(transfer.timestamp*1000).toUTCString()}</div>
            </div>
        </div>
        <div className={style.address}>
            <div><span>From</span> <a>{transfer.from}</a></div>
            <div><span>To</span> <a>{transfer.to}</a></div>
        </div>
        {/*<div>State: {transfer.state} {isFeeChanged ? ', fee have been changed' : ''}</div>*/}
        <div flex="row" justify="between">
            {chain.explorers?.length > 0 ? <a rel="noreferrer"
               className="button text"
               href={`${chain.explorers[0].url}/tx/${transfer._id}`}
               target="_blank">Open in {chain.explorers[0].name}</a> : <span></span>}
            <button className="text" onClick={sendAgain}>{needToSwitchChainId ? `Switch To ${chain.name} and `:''}Send again</button>
        </div>
    </div>

}


const colors: Record<TransferSent['state'], string> = {
    rejected: 'bg-red',
    mined: 'bg-green',
    pending: 'bg-yellow'
}