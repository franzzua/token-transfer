import {Flex} from "antd";
import {CreateTransferButton} from "../components/create-transfer-button";
import {TransferList} from "./transfer-list";
import {useContext} from "react";
import {AppContext} from "../contexts/app-context";
import {useCell} from "../../helpers/use-cell";
import {formatEther, formatUnits} from "ethers";

export const Dashboard = () => {
    const {chainStore} = useContext(AppContext);
    const gasPrices = useCell(chainStore.gasPrices);
    const gasTimes = useCell(chainStore.gasTimes);
    console.log(gasPrices)
    return <Flex vertical gap="2em">
        <CreateTransferButton/>
        <TransferList/>
        {gasPrices && gasTimes && <Flex vertical>
            <span>Fast: {formatUnits(gasPrices.fast, "gwei")} Gwei for {gasTimes.fast} seconds</span>
            <span>Standard: {formatUnits(gasPrices.average, "gwei")} Gwei for {gasTimes.average} seconds</span>
            <span>Slow: {formatUnits(gasPrices.slow, "gwei")} Gwei for {gasTimes.slow} seconds</span>
        </Flex>}
    </Flex>
}