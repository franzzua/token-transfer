import {ChangeEventHandler, FC, useCallback, useEffect, useState} from "react";
import {useCell} from "../../helpers/use-cell";
import {Label} from "../elements/label";
import {useTransferStore} from "../contexts/useTransferStore";
import {MyBalance} from "./my-balance";
import {TokenSelect} from "./token-select";
import style from "./amount-input.module.less";
import {Select} from "../elements/select";

export const AmountInput: FC<{hideMyAmount?: boolean}> = ({hideMyAmount}) => {
    const transferStore = useTransferStore();
    const amount = useCell(() => transferStore.Amount);
    const tokenInfo = useCell(transferStore.TokenInfo);
    const error = useCell(() => transferStore.errors.amount);
    const [amountLocal, setAmountLocal] = useState(amount);
    useEffect(() => {
        setAmountLocal(amount);
    }, [amount]);
    const onChange = useCallback<ChangeEventHandler<HTMLInputElement>>(e => {
        const value = e.currentTarget.value;
        setAmountLocal(value);
        if (Number.isFinite(+value.replace(",", ".")))
            transferStore.Amount = value.replace(",", ".");
    }, [])
    return <Label title="Amount" error={error}>
        <div className={[style.amount, 'control'].join(' ')}>
            <input value={amountLocal} onChange={onChange}/>
            {!hideMyAmount && <MyBalance/>}
            <Select className={style.tokenSelect} value={tokenInfo?.symbol}>
                <TokenSelect value={tokenInfo}
                             onChange={token => transferStore.patch({
                                 tokenAddress: token?.address
                             })}/>
            </Select>
        </div>
    </Label>
}
