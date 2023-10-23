import {Button, Flex} from "antd";
import {MyAmount} from "../components/my-amount";
import {TransferContext} from "../contexts/transfer-context";
import {Transfer} from "../stores/transfers.store";
import {AccountSelect} from "../components/account-select";
import {TargetInput} from "../components/target-input";
import {TokenSelect} from "../components/token-select";
import {useCallback, useContext} from "react";
import {AmountInput} from "../components/amount-input";
import styles from "./add-transfer-form.module.less";

export const AddTransferForm = () => {
    const transferStore = useContext(TransferContext);
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
                <MyAmount />
            </Flex>
        </label>
        <label>
            <span>To</span>
            <TargetInput />
        </label>
        <Button type="primary" onClick={() => transferStore.send()}>Send</Button>
    </div>;
}