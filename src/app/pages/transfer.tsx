import {Button} from "antd";
import {useContext, useMemo} from "react";
import {AddTransferForm} from "../../blocks/add-transfer-form";
import {AppContext} from "../../contexts/app-context";
import {TransferContext} from "../../contexts/transfer-context";
import {useRouter} from "../routing";


export function Transfer(){
    const {accountStore, transfersStore, transferStorage} = useContext(AppContext);
    const {query: {id}} = useRouter();
    const transferStore = useMemo(() => transfersStore.getTransferStore(id), [id]);
    return <TransferContext.Provider value={transferStore}>
        <AddTransferForm/>
    </TransferContext.Provider>
}