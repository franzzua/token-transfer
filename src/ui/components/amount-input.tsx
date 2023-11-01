import {FunctionComponent, JSX} from "preact";
import {useCallback, useEffect, useRef} from "preact/hooks";
import {AmountInputStore} from "../../stores/interfaces";
import {useCell} from "../helpers/use-cell";
import {Label} from "../elements/label";
import {MyBalance} from "./my-balance";
import {TokenSelect} from "./token-select/token-select";
import style from "./amount-input.module.less";
import {Select} from "../elements/select";
import {Cell} from "@cmmn/cell/lib";

export const AmountInput: FunctionComponent<AmountInputProps> = ({hideMyAmount, store}) => {
    const amount = useCell(() => store.Transfer.amount);
    const tokenInfo = useCell(store.TokenInfo);
    const error = useCell(() => store.errors.amount);
    const balance = useCell(() => store.balance);
    const onChange = useCallback<JSX.GenericEventHandler<HTMLInputElement>>(e => {
        const value = e.currentTarget.value;
        store.patch({amount: value.replace(",", ".")});
    }, []);
    const input = useRef<HTMLInputElement>()
    useEffect(() => {
        if (+amount !== +input.current?.value){
            input.current.value = amount ?? '';
        }
    }, [amount]);
    return <Label title={<div flex="row" justify="between">
        <span>Amount</span>
        {!hideMyAmount && <MyBalance balance={balance}/>}
    </div>} error={error}>
        <div className={[style.amount, 'control'].join(' ')}>
            <input autoFocus tabIndex={1} ref={input} onInput={onChange} placeholder="Token Amount"/>
            <Select className={style.tokenSelect} value={tokenInfo?.symbol}>
                <TokenSelect value={tokenInfo}
                             onChange={token => store.patch({
                                 tokenAddress: token?.address
                             })}/>
            </Select>
        </div>
    </Label>
}

export type AmountInputProps = {
    store: AmountInputStore & {amount: string;}
    hideMyAmount?: false;
} | {
    store: AmountInputStore;
    hideMyAmount?: true;
}