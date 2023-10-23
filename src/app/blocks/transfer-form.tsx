import {Button, Flex, Skeleton} from "antd";
import {MyBalance} from "../components/my-balance";
import {TransferContext} from "../contexts/transfer-context";
import {AccountSelect} from "../components/account-select";
import {TargetInput} from "../components/target-input";
import {TokenSelect} from "../components/token-select";
import { useContext} from "react";
import {useCell} from "../../helpers/use-cell";
import {AmountInput} from "../components/amount-input";
import {back, goTo} from "../routing";
import styles from "./transfer-form.module.less";

export const TransferForm = () => {
    const transferStore = useContext(TransferContext);
    const transfer = useCell(() => transferStore.Transfer);
    if (!transfer) //TODO: add loader
        return <Skeleton/>;
    return <div className={styles.container}>
        <label>
            <span>Account</span>
            <AccountSelect />
        </label>

        <label>
            <span>Token</span>
            <TokenSelect />
        </label>
        <label>
            <span>Amount</span>
            <Flex gap="2em">
                <AmountInput />
                <MyBalance />
            </Flex>
        </label>
        <label>
            <span>To</span>
            <TargetInput />
        </label>
        <Button.Group>
            <Button onClick={() => goTo("/main")}>Cancel</Button>
            <Button type="primary" onClick={() => transferStore.send()}>Send</Button>
        </Button.Group>
    </div>;
}