import {useEffect, useMemo} from "preact/hooks";
import {useAppContext} from "../contexts";
import {TransferToMe} from "../blocks/transfer-to-me";
import {goTo, useRouter} from "../routing";

export function TransferToMePage(){
    const appStore = useAppContext()
    const {route: [base, encoded]} = useRouter();
    const transferStore = useMemo(appStore.getTransferToMeStore, []);
    useEffect(() => {
        if (base !== 'ttm') return;
        const transfer = transferStore.parse(encoded as string);
        appStore.create(transfer).then(id => goTo(['transfer'], {id}));
    }, [base, encoded]);
    return <TransferToMe store={transferStore}/>;
}