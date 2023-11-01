import {useEffect, useMemo} from "preact/hooks";
import {useCell} from "../helpers/use-cell";
import {TransferForm} from "../blocks/transfer-form";
import {useAppContext} from "../contexts";
import {goTo, useRouter} from "../routing";


export function TransferPage(){
    const appContext = useAppContext()
    const {query: {id}} = useRouter();
    const transferStore = useMemo(() => appContext.getTransferStore(id as string), [id]);
    const transfer = useCell(() => transferStore.Transfer);
    const isNotExists = useCell(transferStore.isNotExists);
    useEffect(() => {
        if (isNotExists) goTo('/main');
    }, [isNotExists]);
    if (!transfer) return <></>;
    return <TransferForm store={transferStore}/>;
}