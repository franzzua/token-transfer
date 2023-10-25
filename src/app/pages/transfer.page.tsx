import {useContext, useMemo} from "react";
import {IdInjectionToken} from "../../container";
import {TransferStore} from "../../stores/transfer.store";
import {TransferForm} from "../blocks/transfer-form";
import {AppContext} from "../contexts/app-context";
import {TransferContext} from "../contexts/transfer-context";
import {useRouter} from "../routing";


export function TransferPage(){
    const {container} = useContext(AppContext);
    const {query: {id}} = useRouter();
    const transferStore = useMemo(() => container.get<TransferStore>(TransferStore, [{
        provide: IdInjectionToken, useValue: id
    }]), [id]);
    return <TransferContext.Provider value={transferStore}>
        <TransferForm/>
    </TransferContext.Provider>
}