import {CreateTransferButton} from "../components/create-transfer-button";
import {goTo} from "../routing";
import {TransferList} from "./transfer-list";

export const Dashboard = () => {
    return <div flex="column" gap="1">
        <div flex="row" gap="2" wrap="wrap" justify="around">
            <CreateTransferButton/>
            <button onClick={() => goTo("/transferToMe")}>Receive Tokens</button>
        </div>
        <TransferList/>
    </div>
}