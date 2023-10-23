import {Input} from "antd";
import {useContext} from "react";
import {TransferContext} from "../contexts/transfer-context";
import {useCell} from "../helpers/use-cell";

export const TargetInput = () => {
    const transferStore = useContext(TransferContext);
    const transfer = useCell(() => transferStore.Transfer);
    return <Input value={transfer.to}
                  onChange={e => transferStore.patch({to: e.currentTarget.value})}/>
}