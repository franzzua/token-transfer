import {Flex, Radio, Skeleton} from "antd";
import {formatEther} from "ethers";
import {useContext} from "react";
import {AppContext} from "../contexts/app-context";
import {TransferContext} from "../contexts/transfer-context";
import {useCell} from "../../helpers/use-cell";
import {TransferStore} from "../../stores/transfer.store";

export const FeeSelect = () => {
    const {chainStore} = useContext(AppContext);
    const defaultToken = useCell(chainStore.defaultToken);
    const transferStore = useContext(TransferContext) as TransferStore;
    const fee = useCell(() => transferStore.Transfer.fee);
    const info = useCell(transferStore.Fee);
    if (!info) return <Skeleton.Input active/>;
    return <Flex>
        <Radio.Group value={fee} onChange={e => transferStore.patch({fee: e.target.value})}>
            <Radio.Button value='slow'>Slow {formatEther(info.slow)} {defaultToken}</Radio.Button>
            <Radio.Button value='average'>Average {formatEther(info.average)} {defaultToken}</Radio.Button>
            <Radio.Button value='fast'>Fast {formatEther(info.fast)} {defaultToken}</Radio.Button>
        </Radio.Group>
    </Flex>
}