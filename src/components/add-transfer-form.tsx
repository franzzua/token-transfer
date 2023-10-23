import {TokenSelect} from "./token-select";
import {useContext} from "preact/compat";
import {DiContext} from "../app/di-context";
import {useCell} from "../helpers/use-cell";
import {useMemo} from "preact/hooks";
import {getTokenByAddress} from "../services/token.info";
import {AmountInput} from "./amount-input";

export const AddTransferForm = () => {
    const {accountStore, transferStore} = useContext(DiContext);
    const chainId = useCell(() => accountStore.chainId);
    const transfer = useCell(() => transferStore.currentTransfer);
    const symbol = useMemo(() => getTokenByAddress(transfer?.tokenAddress), [transfer?.tokenAddress])
    if (!transfer) //TODO: add loader
        return <></>;
    return <div>
        <TokenSelect chainId={chainId}
                     value={transfer.tokenAddress}
                     onChange={e => transferStore.patchTransfer({
                         _id: transfer._id,
                         tokenAddress: e
                     })}/>
        <AmountInput symbol={symbol}
                     amount={transfer.amount}
                     onAmountChange={amount => transferStore.patchTransfer({
                        _id: transfer._id,
                        amount: amount
                    })}/>
    </div>;
}