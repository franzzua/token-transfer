import {Flex, Input} from "antd";
import {FC, useContext} from "react";
import {TransferContext} from "../contexts/transfer-context";
import {useCell} from "../helpers/use-cell";

export const AmountInput: FC = () => {
    const transferStore = useContext(TransferContext);
    const transfer = useCell(() => transferStore.Transfer);
    return <Flex gap="2em">
        <Input value={transfer.amount.toString()} onChange={e => {
            const value = e.currentTarget.value;
            try {
                const bigint = BigInt(value);
                transferStore.patch({amount: bigint}).catch(console.error);
            } catch (e) {
            }
        }}/>
    </Flex>
}