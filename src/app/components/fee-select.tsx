import {formatEther, formatUnits} from "ethers";
import {useContext} from "react";
import {AppContext} from "../contexts/app-context";
import {TransferContext} from "../contexts/transfer-context";
import {useCell} from "../../helpers/use-cell";
import {TransferStore} from "../../stores/transfer.store";
import style from "./fee-select.module.less";
import {Label} from "../elements/label";

export const FeeSelect = () => {
    const {tokensStore, chainStore} = useContext(AppContext);
    const defaultToken = useCell(tokensStore.defaultToken).symbol;
    const transferStore = useContext(TransferContext) as TransferStore;
    const fee = useCell(() => transferStore.Transfer.fee);
    const info = useCell(transferStore.Fee);
    // const transactions = useCell(() => chainStore.transactions);
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
        {/*<svg width="500" height="500" viewBox="0 0 1000 1000" style={{border: 'solid 1px'}}>*/}
        {/*    {transactions.map(x => <circle key={x.hash} r="1"*/}
        {/*                                   cx={Number(x.maxPriorityFeePerGas/(10n**6n))/2}*/}
        {/*                                   cy={x.time*6}*/}
        {/*    />)}*/}
        {/*</svg>*/}
    </Label>
}

const fees = ["slow", "average", "fast"] as const;
const labels = {
    slow: 'Cheap',
    average: 'Average',
    fast: 'Fast',
}