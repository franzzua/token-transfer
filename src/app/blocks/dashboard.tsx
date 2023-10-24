import {Flex} from "antd";
import {CreateTransferButton} from "../components/create-transfer-button";
import {TransferList} from "./transfer-list";
import {useContext} from "react";
import {AppContext} from "../contexts/app-context";
import {useCell} from "../../helpers/use-cell";

export const Dashboard = () => {
    const {chainStore} = useContext(AppContext);
    const gasPrices = useCell(chainStore.gasPrices);
    const gasTimes = useCell(chainStore.gasTimes);
    return <Flex vertical gap="2em">
        <CreateTransferButton/>
        <TransferList/>
        {gasPrices && gasTimes && <Flex>
            <span>High: {gasPrices.high} Gwei for {gasTimes.high} seconds</span>
            <span>Middle: {gasPrices.middle} Gwei for {gasTimes.middle} seconds</span>
            <span>Low: {gasPrices.low} Gwei for {gasTimes.low} seconds</span>
        </Flex>}
    </Flex>
}