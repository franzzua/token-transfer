import {CreateTransferButton} from "../components/create-transfer-button";
import {goTo} from "../routing";
import {TransferList} from "./transfer-list";

export const Dashboard = () => {
    return <div flex="column" gap="2">
        <CreateTransferButton/>
        <button onClick={() => goTo("/transferToMe")}>Receive Tokens</button>
        <TransferList/>
    </div>
}