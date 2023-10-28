import {Flex} from "antd";
import {FC} from "react";
import {useCell} from "../../helpers/use-cell";
import {TransferStore} from "../../stores/transfer.store";
import {useTransferStore} from "../contexts/useTransferStore";

export const MyBalance: FC = () => {
    const transferStore = useTransferStore<TransferStore>();
    const balance = useCell(() => transferStore.myBalanceFormatted);
    const tokenInfo = useCell(transferStore.TokenInfo);
    if (balance == null)
        return <></>
    return <Flex align="center">
        <span>My amount: {balance} {tokenInfo?.symbol}</span>
    </Flex>
}