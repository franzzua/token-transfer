import {useContext, useMemo} from "react";
import {TransferForm} from "../blocks/transfer-form";
import {AppContext} from "../contexts/app-context";
import {TransferContext} from "../contexts/transfer-context";
import {useRouter} from "../routing";


export function TransferPage(){
    const {transfersStore} = useContext(AppContext);
    const {query: {id}} = useRouter();
    const transferStore = useMemo(() => transfersStore.getTransferStore(id), [id]);
    return <TransferContext.Provider value={transferStore}>
        <TransferForm/>
    </TransferContext.Provider>
}