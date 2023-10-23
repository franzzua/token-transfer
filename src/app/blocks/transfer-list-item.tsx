import {Flex, List} from "antd";
import {FC, useContext, useMemo} from "react";
import {useCell} from "../../helpers/use-cell";
import {AppContext} from "../contexts/app-context";

export const TransferListItem: FC<{id: string}> = ({id}) => {
    const {transfersStore} = useContext(AppContext);
    const store = useMemo(() => transfersStore.getTransferStore(id), [id]);
    const transfer = useCell(() => store.Transfer);
    return <List.Item>
        <Flex vertical>
            <div>From {transfer.from}</div>
            <div>To {transfer.to}</div>
            <div>Amount {transfer.amount.toString()}</div>
            <div>State {transfer.state}</div>
        </Flex>
    </List.Item>
}