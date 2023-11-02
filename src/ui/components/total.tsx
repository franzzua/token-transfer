import {utils} from "ethers";
import {TotalStore} from "../../stores/interfaces";
import {useCell} from "../helpers/use-cell";
import {useAppContext} from "../contexts";
import {FunctionComponent} from "preact";

export const Total: FunctionComponent<{store: TotalStore}> = ({store}) => {
    const {tokensStore} = useAppContext()
    const defaultToken = useCell(tokensStore.defaultToken).symbol;
    const total = useCell(() => store.Total, [], {
        throttle: 3000
    });
    return total && <div flex="column" align="end">
        Total: {utils.formatEther(total)} {defaultToken}
    </div>;
}
