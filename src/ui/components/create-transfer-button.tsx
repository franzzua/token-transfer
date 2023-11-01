import {useCallback} from "preact/hooks";
import {useAppContext} from "../contexts";
import {goTo} from "../routing";

export const CreateTransferButton = () => {
    const appStore = useAppContext()
    const createTransfer = useCallback(async () => {
        const id = await appStore.createNew();
        goTo(['transfer'], {id});
    }, []);
    return <button onClick={createTransfer}>Send Tokens</button>
}