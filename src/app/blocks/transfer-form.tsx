import {TransferStore} from "../../stores/transfer.store";
import {TransferContext} from "../contexts/transfer-context";
import {TargetInput} from "../components/target-input";
import { useContext} from "react";
import {useCell} from "../../helpers/use-cell";
import {AmountInput} from "../components/amount-input";
import {goTo} from "../routing";
import {FeeSelect} from "../components/fee-select";

export const TransferForm = () => {
    const transferStore = useContext(TransferContext) as TransferStore;
    const transfer = useCell(() => transferStore.Transfer);
    if (!transfer) //TODO: add loader
        return 'Loading...';
    return <div className="frost-card"
                style={{maxWidth: 600, margin: 'auto'}} title={"Send tokens"}>
        <div flex="column" gap="1">
            <AmountInput />
            <TargetInput />
            <FeeSelect />
            <div className="divider"/>
            <div flex="row" align="center" justify="between">
                <button onClick={() => goTo("/main")}>Cancel</button>
                <button className="primary" onClick={async () => {
                    transferStore.send();
                    goTo("/main")
                }}>Send</button>
            </div>
        </div>
    </div>;
}