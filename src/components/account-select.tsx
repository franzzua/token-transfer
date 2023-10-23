import {Select, SelectProps} from "antd";
import {FunctionComponent} from "react";
import {useContext, JSX} from "react";
import {useEffect} from "react";
import {AppContext} from "../contexts/app-context";
import {useCell} from "../helpers/use-cell";

export type AccountSelectProps = {
    account: string;
    onChange(account: string): void;
} & SelectProps<string>;
export const AccountSelect: FunctionComponent<AccountSelectProps> = ({account, ...props}) => {
    const {accountStore} = useContext(AppContext);
    const accounts = useCell(() => accountStore.accounts);
    useEffect(() => {
        if (!account && accounts.length == 1){
            props.onChange(accounts[0]);
        }
    }, [accounts.length, !account]);
    return <Select<string> {...props}
                   value={account}>
        {accounts.map(x => <Select.Option key={x} value={x}>{x}</Select.Option>)}
    </Select>
}