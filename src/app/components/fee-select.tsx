import {Flex, Slider} from "antd";
import {formatUnits} from "ethers";
import {useContext} from "react";
import {TransferContext} from "../contexts/transfer-context";
import {useCell} from "../../helpers/use-cell";
import {Label} from "../elements/label";
import {TransferStore} from "../../stores/transfer.store";

export const FeeSelect = () => {
    const transferStore = useContext(TransferContext) as TransferStore;
    const fee = useCell(() => transferStore.Transfer.fee);
    const info = useCell(transferStore.Fee);
    return <Label title="Fee">
        {info && <Flex vertical>
            <span>Fast: {formatUnits(info.fast, "ether")} Eth</span>
            <span>Standard: {formatUnits(info.average, "ether")} Eth</span>
            <span>Slow: {formatUnits(info.slow, "ether")} Eth</span>
        </Flex>}
        <Slider value={Number(fee)} />
    </Label>
}