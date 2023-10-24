import {Flex, Skeleton} from "antd";
import {FC, useContext, useMemo} from "react";
import {TransferContext} from "../contexts/transfer-context";
import {useCell} from "../../helpers/use-cell";

export const MyBalance: FC = () => {
    const transferStore = useContext(TransferContext);
    const balance = useCell(() => transferStore.myBalanceFormatted);
    const symbol = useCell(() => transferStore.TokenInfo?.symbol);
    return <Flex align="center">
        <span>My amount: {balance !== null ? balance: <Skeleton.Input active/>} {symbol}</span>
    </Flex>
}