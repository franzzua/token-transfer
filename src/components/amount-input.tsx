import {Flex, Input} from "antd";
import {FC, useContext, useState} from "react";
import {TransferContext} from "../contexts/transfer-context";
import {useCell} from "../helpers/use-cell";

export const AmountInput: FC = () => {
    const transferStore = useContext(TransferContext);
    const amount = useCell(() => transferStore.Amount);
    const [localAmount, setLocalAmount] = useState(amount);
    return <Flex gap="2em">
        <Input value={localAmount} onChange={e => {
            const value = e.currentTarget.value;
            setLocalAmount(value);
            if (Number.isFinite(+value))
                transferStore.Amount = value;
        }}/>
    </Flex>
}