import {List} from "antd";
import {useContext} from "react";
import {useCell} from "../../helpers/use-cell";
import {AppContext} from "../contexts/app-context";
import {TransferListItem} from "./transfer-list-item";

export const TransferList = () => {
    const appStore = useContext(AppContext);
    const transfers = useCell(() => appStore.Transfers);

    return <List>
        {transfers.map(x => <TransferListItem key={x._id} id={x._id}/>)}
    </List>
}