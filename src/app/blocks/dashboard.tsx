import {Flex} from "antd";
import {CreateTransferButton} from "../components/create-transfer-button";
import {TransferList} from "./transfer-list";

export const Dashboard = () => {
    return <Flex vertical gap="2em">
        <CreateTransferButton/>
        <TransferList/>
    </Flex>
}