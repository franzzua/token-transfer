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
    const accounts = useCell(() => accountStore.accounts);
    const me = useCell(() => accountStore.me);
    return <Select<string> onChange={e => accountStore.me = e}
                           value={me}>
        {accounts.map(x => <Select.Option key={x} value={x}>{x}</Select.Option>)}
    </Select>;
}