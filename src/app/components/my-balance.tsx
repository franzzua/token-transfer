import {Flex, Skeleton} from "antd";
import {FC, useContext, useMemo} from "react";
import {TransferContext} from "../contexts/transfer-context";
import {useCell} from "../../helpers/use-cell";
import {TransferStore} from "../../stores/transfer.store";

export const MyBalance: FC = () => {
    const transferStore = useContext(TransferContext) as TransferStore;
    const balance = useCell(() => transferStore.myBalanceFormatted);
    const tokenInfo = useCell(transferStore.TokenInfo);
    if (balance == null)
        return <></>
    return <Flex align="center">
        <span>My amount: {balance} {tokenInfo?.symbol}</span>
    </Flex>
}