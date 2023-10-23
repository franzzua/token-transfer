import {Select, SelectProps} from "antd";
import {FunctionComponent} from "react";
import {useContext, JSX} from "react";
import {useEffect} from "react";
import {AppContext} from "../contexts/app-context";
import {TransferContext} from "../contexts/transfer-context";
import {useCell} from "../helpers/use-cell";

export const AccountSelect: FunctionComponent = () => {
    const {accountStore} = useContext(AppContext);
    const transferStore = useContext(TransferContext);
    const accounts = useCell(() => accountStore.accounts);
    const transfer = useCell(() => transferStore.Transfer);
    useEffect(() => {
        if (!transfer.from && accounts.length == 1){
            transferStore.patch({from: accounts[0]});
        }
    }, [accounts.length, transfer.from]);
    return <Select<string> onChange={e => transferStore.patch({from: e})}
                           value={transfer.from}>
        {accounts.map(x => <Select.Option key={x} value={x}>{x}</Select.Option>)}
    </Select>
}