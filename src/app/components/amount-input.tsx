import {Flex, Input} from "antd";
import {FC, useContext, useState} from "react";
import {useCell} from "../../helpers/use-cell";
import {AppContext} from "../contexts/app-context";
import {Label} from "../elements/label";
import {useTransferStore} from "../contexts/useTransferStore";
import {MyBalance} from "./my-balance";
import {TokenSelect} from "./token-select";

export const AmountInput: FC<{noMyAmount?: boolean}> = ({noMyAmount}) => {
    const {accountStore, chainStore} = useContext(AppContext);
    const defaultToken = useCell(chainStore.defaultToken);
    const transferStore = useTransferStore();
    const amount = useCell(() => transferStore.Amount);
    const [localAmount, setLocalAmount] = useState(amount);
    const error = useCell(() => transferStore.errors.amount);
    return <Label title="Amount" error={error}>
        <Flex gap="2em">
            <Input value={localAmount}
                   addonAfter={<TokenSelect/>}
                   onChange={e => {
                        const value = e.currentTarget.value;
                        setLocalAmount(value);
                        if (Number.isFinite(+value))
                            transferStore.Amount = value;
                    }}/>
            {!noMyAmount && <MyBalance/>}
        </Flex>
    </Label>
}