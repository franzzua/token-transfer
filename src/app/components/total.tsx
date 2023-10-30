import {formatEther} from "ethers";
import {useContext} from "react";
import {useCell} from "../../helpers/use-cell";
import {TransferStore} from "../../stores/transfer.store";
import {AppContext} from "../contexts/app-context";
import {TransferContext} from "../contexts/transfer-context";

export const Total = () => {
    const {tokensStore, chainStore} = useContext(AppContext);
    const defaultToken = useCell(tokensStore.defaultToken).symbol;
    const transferStore = useContext(TransferContext) as TransferStore;
    const total = useCell(() => transferStore.Total);
    return total && <div flex="column" align="end">
        Total: {formatEther(total)} {defaultToken}
    </div>;
}