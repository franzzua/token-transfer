import {TransferToMeStore} from "../../stores/transfer-to-me.store";
import {AmountInput} from "../components/amount-input";
import {TtmLink} from "../components/ttm-link";
import {goTo} from "../routing";
import {FunctionComponent} from "preact";

export const TransferToMe: FunctionComponent<{store: TransferToMeStore}> = ({store}) => {
    return <div className="frost-card" style={{maxWidth: 600, margin: 'auto'}}>
        <div flex="column" gap="2">
            <AmountInput hideMyAmount store={store}/>
            <TtmLink store={store}/>
            <div flex="row" align="center" justify="between">
                <button onClick={() => goTo("/main")}>Cancel</button>
                <button className="primary" onClick={async () => {
                    const url = store.URL;
                    await navigator.clipboard.writeText(url);
                    goTo("/main")
                }}>Copy</button>
            </div>
        </div>
    </div>
}