import {useContext, useEffect, useMemo} from "react";
import {TransferContext} from "../contexts/transfer-context";
import {TransferToMeStore} from "../../stores/transfer-to-me.store";
import {TransferToMe} from "../blocks/transfer-to-me";
import {goTo, useRouter} from "../routing";
import {AppContext} from "../contexts/app-context";

export function TransferToMePage(){
    const {transfersStore} = useContext(AppContext);
    const {route: [base, encoded]} = useRouter();
    const transferStore = useMemo(() => new TransferToMeStore(), []);
    useEffect(() => {
        if (base !== 'ttm') return;
        const transfer = transferStore.parse(encoded as string);
        console.log(transfer);
        transfersStore.create(transfer).then(id => goTo(['transfer'], {id}));
    }, [base, encoded]);
    return <TransferContext.Provider value={transferStore as any}>
        <TransferToMe/>
    </TransferContext.Provider>
}