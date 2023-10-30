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
    const amount = useCell(() => transferStore.Transfer.amount);
    const tokenInfo = useCell(transferStore.TokenInfo);
    const error = useCell(() => transferStore.errors.amount);
    const onChange = useCallback<ChangeEventHandler<HTMLInputElement>>(e => {
        const value = e.currentTarget.value;
        transferStore.patch({amount: value.replace(",", ".")});
    }, [])
    return <Label title={<div flex="row" justify="between">
        <span>Amount</span>
        {!hideMyAmount && <MyBalance/>}
    </div>} error={error}>
        <div className={[style.amount, 'control'].join(' ')}>
            <input value={amount ?? ''} onChange={onChange} placeholder="Amount of tokens to sent"/>
            <Select className={style.tokenSelect} value={tokenInfo?.symbol}>
                <TokenSelect value={tokenInfo}
                             onChange={token => transferStore.patch({
                                 tokenAddress: token?.address
                             })}/>
            </Select>
        </div>
    </Label>
}
