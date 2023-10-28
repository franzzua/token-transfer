import {useContext, useEffect, useMemo} from "react";
import {TransferContext} from "../contexts/transfer-context";
import {TransferToMe} from "../blocks/transfer-to-me";
import {goTo, useRouter} from "../routing";
import {AppContext} from "../contexts/app-context";

export function TransferToMePage(){
    const appStore = useContext(AppContext);
    const {route: [base, encoded]} = useRouter();
    const transferStore = useMemo(appStore.getTransferToMeStore, []);
    useEffect(() => {
        if (base !== 'ttm') return;
        const transfer = transferStore.parse(encoded as string);
        appStore.create(transfer).then(id => goTo(['transfer'], {id}));
    }, [base, encoded]);
    return <TransferContext.Provider value={transferStore as any}>
        <TransferToMe/>
    </TransferContext.Provider>
}