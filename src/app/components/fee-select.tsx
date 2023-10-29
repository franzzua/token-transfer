import {formatEther, formatUnits} from "ethers";
import {useContext} from "react";
import {AppContext} from "../contexts/app-context";
import {TransferContext} from "../contexts/transfer-context";
import {useCell} from "../../helpers/use-cell";
import {TransferStore} from "../../stores/transfer.store";
import style from "./fee-select.module.less";
import {Label} from "../elements/label";

export const FeeSelect = () => {
    const {tokensStore} = useContext(AppContext);
    const defaultToken = useCell(tokensStore.defaultToken).symbol;
    const transferStore = useContext(TransferContext) as TransferStore;
    const fee = useCell(() => transferStore.Transfer.fee);
    const info = useCell(transferStore.Fee);
    if (!info) return 'Loading...';
    return <Label title="Fee">
        <div className={style.feeSelect} flex="row" justify="between" gap="1">
            {fees.map(f => (
                <label key={f}>
                    <input type="radio" value="slow" name="fee"
                           onChange={e => transferStore.patch({fee: f})}
                           checked={fee == f}/>
                    <span>{labels[f]}</span>
                    <span>{(+formatUnits(info[f], 12)).toFixed(0)} µ{defaultToken}</span>
                </label>
            ))}
        </div>
    </Label>
}

const fees = ["slow", "average", "fast"] as const;
const labels = {
    slow: '> 1 min',
    average: '30 - 60 sec',
    fast: '< 30 sec',
}