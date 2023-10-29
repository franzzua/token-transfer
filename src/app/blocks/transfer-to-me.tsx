import {AmountInput} from "../components/amount-input";
import {TtmLink} from "../components/ttm-link";

export const TransferToMe = () => {
    return <div className="frost-card">
        <div flex="column">
            <AmountInput hideMyAmount/>
            <TtmLink/>
        </div>
    </div>
}