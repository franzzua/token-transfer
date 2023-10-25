import {Flex, List} from "antd";
import {FC, useContext, useMemo} from "react";
import {IdInjectionToken} from "../../container";
import {useCell} from "../../helpers/use-cell";
import {TransferStore} from "../../stores/transfer.store";
import {AppContext} from "../contexts/app-context";
import {goTo} from "../routing";

export const TransferListItem: FC<{id: string}> = ({id}) => {
    const {container} = useContext(AppContext);
    const store = useMemo(() => container.get<TransferStore>(TransferStore, [{
        provide: IdInjectionToken, useValue: id
    }]), [id]);
    const transfer = useCell(() => store.Transfer);
    const amount = useCell(() => store.Amount);
    const tokenInfo = useCell(() => store.TokenInfo);
    return <List.Item onClick={() => goTo(['transfer'], {id})}>
        <Flex vertical>
            <div>From {transfer.from}</div>
            <div>To {transfer.to}</div>
            <div>Amount {amount} {tokenInfo?.symbol}</div>
            <div>State {transfer.state}</div>
        </Flex>
    </List.Item>
}