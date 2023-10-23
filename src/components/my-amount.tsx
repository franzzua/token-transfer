import {Flex, Skeleton} from "antd";
import {FC, useContext, useMemo} from "react";
import {TransferContext} from "../contexts/transfer-context";
import {useCell} from "../helpers/use-cell";

export const MyAmount: FC = () => {
    const transferStore = useContext(TransferContext);
    const balance = useCell(transferStore.MyBalance);
    const symbol = useCell(() => transferStore.TokenInfo?.symbol);
    return <Flex>
        <span>My amount</span>
        {balance !== null ? balance.toString(10): <Skeleton.Input active/>}
        {symbol}
    </Flex>
}