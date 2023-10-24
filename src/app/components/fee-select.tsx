import {Slider} from "antd";
import {useContext} from "react";
import {TransferContext} from "../contexts/transfer-context";
import {useCell} from "../../helpers/use-cell";
import {Label} from "../elements/label";

export const FeeSelect = () => {
    const transferStore = useContext(TransferContext);
    const fee = useCell(() => transferStore.Transfer.fee);
    const info = useCell(transferStore.Fee);
    console.log(fee, info);
    return <Label title="Fee">
        <Slider value={Number(fee)} />
    </Label>
}