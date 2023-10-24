import {Input} from "antd";
import {useContext} from "react";
import {TransferContext} from "../contexts/transfer-context";
import {useCell} from "../../helpers/use-cell";
import {Label} from "../elements/label";

export const TargetInput = () => {
    const transferStore = useContext(TransferContext);
    const transfer = useCell(() => transferStore.Transfer);
    const error = useCell(() => transferStore.errors.to);
    return <Label title="To" error={error}>
        <Input value={transfer.to}
                  onChange={e => transferStore.patch({to: e.currentTarget.value})}/>
    </Label>;
}