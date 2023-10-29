import {useCallback, useContext} from "react";
import {AppContext} from "../contexts/app-context";
import {goTo} from "../routing";

export const CreateTransferButton = () => {
    const appStore = useContext(AppContext);
    const createTransfer = useCallback(async () => {
        const id = await appStore.createNew();
        goTo(['transfer'], {id});
    }, []);
    return <button onClick={createTransfer}>Send Tokens</button>
}