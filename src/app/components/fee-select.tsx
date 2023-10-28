import {Flex, Radio, Skeleton} from "antd";
import {formatEther} from "ethers";
import {useContext} from "react";
import {TransferContext} from "../contexts/transfer-context";
import {useCell} from "../../helpers/use-cell";
import {TransferStore} from "../../stores/transfer.store";

export const FeeSelect = () => {
    const transferStore = useContext(TransferContext) as TransferStore;
    const fee = useCell(() => transferStore.Transfer.fee);
    const info = useCell(transferStore.Fee);
    if (!info) return <Skeleton.Input active/>;
    return <Flex>
        <Radio.Group value={fee} onChange={e => transferStore.patch({fee: e.target.value})}>
            <Radio.Button value='slow'>Slow {formatEther(info.slow)} ETH</Radio.Button>
            <Radio.Button value='average'>Average {formatEther(info.average)}</Radio.Button>
            <Radio.Button value='fast'>Fast {formatEther(info.fast)}</Radio.Button>
        </Radio.Group>
    </Flex>
}