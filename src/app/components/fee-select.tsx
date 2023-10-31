import {formatUnits} from "ethers";
import {useAppContext} from "../contexts";
import {useCell} from "../../helpers/use-cell";
import {TransferStore} from "../../stores/transfer.store";
import {useTransferStore} from "../contexts/useTransferStore";
import style from "./fee-select.module.less";
import {Label} from "../elements/label";

export const FeeSelect = () => {
    const {tokensStore, chainStore} = useAppContext()
    const defaultToken = useCell(tokensStore.defaultToken).symbol;
    const transferStore = useTransferStore() as TransferStore;
    const fee = useCell(() => transferStore.Transfer.fee);
    const info = useCell(transferStore.Fee);
    if (!info) return 'Loading gas prices...';
    return <Label title="Fee">
        <div className={style.feeSelect} >
            {fees.map((f,i) => (
                <label key={f}>
                    <input type="radio" value="slow" name="fee" tabIndex={3+i}
                           onChange={e => transferStore.patch({fee: f})}
                           checked={fee == f}/>
                    <span>{labels[f]}</span>
                    <span className="text-sm">{info[f].timePercs[0]?.toFixed(0)} - {info[f].timePercs[2]?.toFixed(0)} seconds</span>
                    <b>{(+formatUnits(info[f].fee, 12)).toFixed(0)} µ{defaultToken}</b>
                </label>
            ))}
        </div>
    </Label>
}

const fees = ["slow", "average", "fast"] as const;
const labels = {
    slow: 'Cheap',
    average: 'Average',
    fast: 'Fast',
}