import {TransferToMeStore} from "../../stores/transfer-to-me.store";
import {AmountInput} from "../components/amount-input";
import {TtmLink} from "../components/ttm-link";
import {useTransferStore} from "../contexts/useTransferStore";
import {goTo} from "../routing";

export const TransferToMe = () => {
    const transferStore = useTransferStore<TransferToMeStore>();
    return <div className="frost-card" style={{maxWidth: 600, margin: 'auto'}}>
        <div flex="column" gap="2">
            <AmountInput hideMyAmount/>
            <TtmLink/>
            <div flex="row" align="center" justify="between">
                <button onClick={() => goTo("/main")}>Cancel</button>
                <button className="primary" onClick={async () => {
                    const url = transferStore.URL;
                    await navigator.clipboard.writeText(url);
                    goTo("/main")
                }}>Copy</button>
            </div>
        </div>
    </div>
}