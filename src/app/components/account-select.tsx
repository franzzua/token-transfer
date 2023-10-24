import {Flex, Select, SelectProps, Typography} from "antd";
import {FunctionComponent} from "react";
import {useContext, JSX} from "react";
import {useEffect} from "react";
import {AppContext} from "../contexts/app-context";
import {TransferContext} from "../contexts/transfer-context";
import {useCell} from "../../helpers/use-cell";
import {Label} from "../elements/label";

export const AccountSelect: FunctionComponent = () => {
    const {accountStore} = useContext(AppContext);
    const transferStore = useContext(TransferContext);
    const accounts = useCell(() => accountStore.accounts);
    const transfer = useCell(() => transferStore.Transfer);
    const error = useCell(() => transferStore.errors.from);
    useEffect(() => {
        if (!transfer.from && accounts.length == 1){
            transferStore.patch({from: accounts[0]});
        }
    }, [accounts.length == 1, !!transfer.from]);
    return <Label error={error} title="Account">
        <Select<string> onChange={e => transferStore.patch({from: e})}
                           value={transfer.from}>
            {accounts.map(x => <Select.Option key={x} value={x}>{x}</Select.Option>)}
        </Select>
        {error && <Typography>{error}</Typography>}
    </Label>
}