import {formatEther} from "ethers/utils";
import {useContext} from "preact/hooks";
import {useCell} from "../helpers/use-cell";
import {TransferStore} from "../../stores/transfer.store";
import {useAppContext} from "../contexts";
import {TransferContext} from "../contexts/transfer-context";

export const Total = () => {
    const {tokensStore, chainStore} = useAppContext()
    const defaultToken = useCell(tokensStore.defaultToken).symbol;
    const transferStore = useContext(TransferContext) as TransferStore;
    const total = useCell(() => transferStore.Total, [], {
        throttle: 3000
    });
    return total && <div flex="column" align="end">
        Total: {formatEther(total)} {defaultToken}
    </div>;
}