import {Button, Flex} from "antd";
import {CreateTransferButton} from "../components/create-transfer-button";
import {goTo} from "../routing";
import {TransferList} from "./transfer-list";

export const Dashboard = () => {
    return <Flex vertical gap="2em">
        <CreateTransferButton/>
        <Button type="primary" onClick={() => goTo("/transferToMe")}>Receive Tokens</Button>
        <TransferList/>
    </Flex>
}