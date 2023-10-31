import {FC, useCallback, useContext, useMemo} from "react";
import {useCell} from "../../helpers/use-cell";
import {AppContext} from "../contexts/app-context";
import {goTo} from "../routing";

export const SentTransfer: FC<{id: string}> = ({id}) => {
    const appContext = useContext(AppContext);
    const store = useMemo(() => appContext.getTransferSentStore(id), [id]);
    const {
        transfer, amount, tokenInfo, fee, isFeeChanged
    } = useCell(store.Info);
    const needToSwitchChainId = useCell(() => appContext.accountStore.chainId !== transfer.chainId);
    const chainName = useMemo(() => appContext.chainStore.getChain(transfer.chainId), [transfer.chainId]).name;
    const sendAgain = useCallback(async () => {
        if (transfer.chainId !== appContext.accountStore.chainId){
            await appContext.accountStore.switchToChain(transfer.chainId);
        }
        const id = await appContext.create({
            amount: amount,
            to: transfer.to,
            tokenAddress: transfer.tokenAddress,
            fee: "average",
            _id: undefined
        });
        goTo('/transfer', {id});
    }, [transfer, amount])
    return <div className={[colors[transfer.state]].join(' ')}
                style={{padding: '1em', margin: '1em', borderRadius: '8px'}}
                flex="column" gap="0.5">
        <div>From: {transfer.from}</div>
        <div>To: {transfer.to}</div>
        <div>Amount: {amount} {tokenInfo?.symbol}</div>
        <div>State: {transfer.state} {isFeeChanged ? ', fee have been changed' : ''}</div>
        <div flex="row" justify="end">
            <button className="primary" onClick={sendAgain}>{needToSwitchChainId ? `Switch To ${chainName} and `:''}Send again</button>
        </div>
    </div>

}


const colors: Record<TransferSent['state'], string> = {
    rejected: 'bg-red',
    mined: 'bg-green',
    signed: 'bg-yellow'
}