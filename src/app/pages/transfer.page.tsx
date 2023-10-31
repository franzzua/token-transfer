import {useEffect, useMemo} from "preact/hooks";
import {useCell} from "../../helpers/use-cell";
import {TransferForm} from "../blocks/transfer-form";
import {useAppContext} from "../contexts";
import {TransferContext} from "../contexts/transfer-context";
import {goTo, useRouter} from "../routing";


export function TransferPage(){
    const appContext = useAppContext()
    const {query: {id}} = useRouter();
    const transferStore = useMemo(() => appContext.getTransferStore(id as string), [id]);
    const transfer = useCell(() => transferStore.Transfer);
    useEffect(() => {
        if (transfer) return;
        goTo('/main');
    }, [!transfer]);
    return <TransferContext.Provider value={transferStore}>
        <TransferForm/>
    </TransferContext.Provider>
}