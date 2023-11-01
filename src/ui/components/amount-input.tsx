import {FunctionComponent, JSX} from "preact";
import {useCallback, useEffect, useRef, useState} from "preact/hooks";
import {useCell} from "../helpers/use-cell";
import {Label} from "../elements/label";
import {useTransferStore} from "../contexts/useTransferStore";
import {MyBalance} from "./my-balance";
import {TokenSelect} from "./token-select";
import style from "./amount-input.module.less";
import {Select} from "../elements/select";

export const AmountInput: FunctionComponent<{hideMyAmount?: boolean}> = ({hideMyAmount}) => {
    const transferStore = useTransferStore();
    const amount = useCell(() => transferStore.Transfer.amount);
    const tokenInfo = useCell(transferStore.TokenInfo);
    const error = useCell(() => transferStore.errors.amount);
    const onChange = useCallback<JSX.GenericEventHandler<HTMLInputElement>>(e => {
        const value = e.currentTarget.value;
        transferStore.patch({amount: value.replace(",", ".")});
    }, []);
    const input = useRef<HTMLInputElement>()
    useEffect(() => {
        if (+amount !== +input.current?.value){
            input.current.value = amount ?? '';
        }
    }, [amount]);
    return <Label title={<div flex="row" justify="between">
        <span>Amount</span>
        {!hideMyAmount && <MyBalance/>}
    </div>} error={error}>
        <div className={[style.amount, 'control'].join(' ')}>
            <input autoFocus tabIndex={1} ref={input} onInput={onChange} placeholder="Amount of tokens"/>
            <Select className={style.tokenSelect} value={tokenInfo?.symbol}>
                <TokenSelect value={tokenInfo}
                             onChange={token => transferStore.patch({
                                 tokenAddress: token?.address
                             })}/>
            </Select>
        </div>
    </Label>
}
