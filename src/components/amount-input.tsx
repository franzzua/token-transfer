import {FunctionalComponent} from "preact";
import {useMemo} from "preact/hooks";
import {getTokenByAddress} from "../services/token.info";

export type AmountInputProps = {
    symbol: string;
    amount: bigint;
    onAmountChange(amount: bigint);
}
export const AmountInput: FunctionalComponent<AmountInputProps> = props => {
    return <div>
        <input value={props.amount.toString()} onChange={e => {
            const value = e.currentTarget.value;
            try {
                const bigint = BigInt(value);
                props.onAmountChange(bigint);
            } catch (e) {
            }
        }}/>
    </div>
}