import {Button} from "antd";
import {useCallback, useContext} from "react";
import {AppContext} from "../contexts/app-context";
import {goTo} from "../routing";

export const CreateTransferButton = () => {
    const {transfersStore} = useContext(AppContext);
    const createTransfer = useCallback(async () => {
        const id = await transfersStore.createNew();
        goTo(['transfer'], {id});
    }, []);
    return <Button type="primary" onClick={createTransfer}>Send Tokens</Button>
}