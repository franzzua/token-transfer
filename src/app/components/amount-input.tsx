import {Flex, Input} from "antd";
import {ChangeEventHandler, FC, useCallback, useContext, useState} from "react";
import {useCell} from "../../helpers/use-cell";
import {AppContext} from "../contexts/app-context";
import {Label} from "../elements/label";
import {useTransferStore} from "../contexts/useTransferStore";
import {MyBalance} from "./my-balance";
import {TokenSelect} from "./token-select";

export const AmountInput: FC<{hideMyAmount?: boolean}> = ({hideMyAmount}) => {
    const transferStore = useTransferStore();
    const amount = useCell(() => transferStore.Amount);
    const tokenInfo = useCell(transferStore.TokenInfo);
    const [localAmount, setLocalAmount] = useState(amount);
    const error = useCell(() => transferStore.errors.amount);
    const [showTokenSelect, setShowTokenSelect] = useState(false);
    const onChange = useCallback<ChangeEventHandler<HTMLInputElement>>(e => {
        const value = e.currentTarget.value;
        setLocalAmount(value);
        if (Number.isFinite(+value))
            transferStore.Amount = value;
    }, [])
    const TokenSelectorAddon = (
        <Flex gap="1em" align="center"
              onClick={() => setShowTokenSelect(x => !x)}>
            {tokenInfo?.symbol}
            <span>{showTokenSelect ? '▲' : '▼'}</span>
        </Flex>
    );
    return <Label title="Amount" error={error}>
        <Flex gap="2em">
            <Input value={localAmount}
                   addonAfter={TokenSelectorAddon}
                   onChange={onChange}/>
            {!hideMyAmount && <MyBalance/>}
        </Flex>
        {showTokenSelect && <TokenSelect value={tokenInfo}
                                         onChange={token => {
                                             setShowTokenSelect(false);
                                             transferStore.patch({
                                                 tokenAddress: token?.address
                                             });
                                         }}/>}
    </Label>
}
