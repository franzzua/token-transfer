import {Button, Flex} from "antd";
import {MyAmount} from "../components/my-amount";
import {TransferContext} from "../contexts/transfer-context";
import {Transfer} from "../stores/transfers.store";
import {AccountSelect} from "../components/account-select";
import {TargetInput} from "../components/target-input";
import {TokenSelect} from "../components/token-select";
import {useCallback, useContext} from "react";
import {AppContext} from "../contexts/app-context";
import {useCell} from "../helpers/use-cell";
import {useMemo} from "react";
import {getTokenByAddress} from "../services/token.info";
import {AmountInput} from "../components/amount-input";
import styles from "./add-transfer-form.module.less";

export const AddTransferForm = () => {
    const {accountStore} = useContext(AppContext);
    const transferStore = useContext(TransferContext);
    const chainId = useCell(() => accountStore.chainId);
    const transfer = useCell(() => transferStore.Transfer);
    const symbol = useMemo(() => getTokenByAddress(transfer?.tokenAddress)?.symbol, [transfer?.tokenAddress])
    if (!transfer) //TODO: add loader
        return <></>;
    return <div className={styles.container}>
        <label>
            <span>Account</span>
            <AccountSelect account={transfer.from}
                           onChange={from => transferStore.patch({from})}/>
        </label>

        <label>
            <span>Token</span>
            <TokenSelect chainId={chainId}
                         value={transfer.tokenAddress}
                         onChange={tokenAddress => transferStore.patch({ tokenAddress })}/>
        </label>
        <label>
            <span>Amount</span>
            <Flex gap="2em">
                <AmountInput symbol={symbol}
                             amount={transfer.amount}
                             onChange={amount => transferStore.patch({ amount })}/>
                <MyAmount />
            </Flex>
        </label>
        <label>
            <span>To</span>
            <TargetInput target={transfer.to}
                         onChange={to => transferStore.patch({to})}/>
        </label>
        <Button type="primary" onClick={() => transferStore.send()}>Send</Button>
    </div>;
}