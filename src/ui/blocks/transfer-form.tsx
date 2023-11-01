import {TransferStore} from "../../stores/transfer.store";
import {Total} from "../components/total";
import {TargetInput} from "../components/target-input";
import {useCell} from "../helpers/use-cell";
import {AmountInput} from "../components/amount-input";
import {goTo} from "../routing";
import {FeeSelect} from "../components/fee-select";
import {FunctionComponent} from "preact";

export const TransferForm: FunctionComponent<{store: TransferStore}> = ({store}) => {
    const isValid = useCell(() => store.isValid);
    return <div className="frost-card" title={"Send tokens"}>
        <div flex="column" gap="1">
            <AmountInput store={store}/>
            <TargetInput store={store}/>
            <FeeSelect store={store}/>
            <Total store={store}/>
            <div className="divider"/>
            <div flex="row" align="center" justify="between">
                <div flex="row" align="center" gap="1">
                    <button onClick={() => goTo("/main")}>Save and exit</button>
                    <button onClick={async () => {
                        await store.remove();
                        goTo("/main");
                    }}>Discard</button>
                </div>
                <button disabled={!isValid} className="primary" onClick={async () => {
                    await store.send();
                    goTo("/main")
                }}>Send</button>
            </div>
        </div>
    </div>;
}