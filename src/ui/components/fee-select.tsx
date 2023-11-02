import {FunctionalComponent} from "preact";
import {utils} from "ethers";
import {IFeeSelectStore} from "../../stores/interfaces";
import {useAppContext} from "../contexts";
import {useCell} from "../helpers/use-cell";
import style from "./fee-select.module.less";
import {Label} from "../elements/label";

export const FeeSelect: FunctionalComponent<{store: IFeeSelectStore}> = ({store}) => {
    const {tokensStore} = useAppContext()
    const defaultToken = useCell(tokensStore.defaultToken).symbol;
    const fee = useCell(() => store.Transfer.fee);
    const info = useCell(() => store.Fees, [], {
        throttle: 3000
    });
    if (!info) return <>Loading gas prices...</>;
    return <Label title="Fee">
        <div className={style.feeSelect} >
            {fees.map((f,i) => (
                <label key={f}>
                    <input type="radio" value="slow" name="fee" tabIndex={3+i}
                           onChange={e => store.patch({fee: f})}
                           checked={fee == f}/>
                    <span>{labels[f]}</span>
                    <span className="text-xs">{formatTimes(info[f].timePercs)}</span>
                    <b>{formatFee(info[f].fee/10n, defaultToken)}</b>
                </label>
            ))}
        </div>
    </Label>
}

function formatTimes(times: [number, number, number]){
    if (Number.isNaN(+times[0]) || Number.isNaN(+times[1]))
        return '';
    return `${times[0]?.toFixed(0)} - ${times[2]?.toFixed(0)} seconds`;
}
function formatFee(fee: bigint, token: string) {
    const value = +utils.formatUnits(fee, 12);
    if (value > 1)
        return `${value.toFixed(0)} µ${token}`
    return `${value.toPrecision(3)} µ${token}`
}

const fees = ["slow", "average", "fast"] as const;
const labels = {
    slow: 'Cheap',
    average: 'Average',
    fast: 'Fast',
}
