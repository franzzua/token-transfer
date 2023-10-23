import {Flex, Input} from "antd";
import {FC} from "react";

export type AmountInputProps = {
    symbol: string;
    amount: bigint;
    onChange(amount: bigint): void;
}
export const AmountInput: FC<AmountInputProps> = props => {
    return <Flex gap="2em">
        <Input value={props.amount.toString()} onChange={e => {
            const value = e.currentTarget.value;
            try {
                const bigint = BigInt(value);
                props.onChange(bigint);
            } catch (e) {
            }
        }}/>
    </Flex>
}