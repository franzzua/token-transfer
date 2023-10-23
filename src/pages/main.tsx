import {useContext} from "preact/compat";
import {DiContext} from "../app/di-context";
import {AddTransferForm} from "../components/add-transfer-form";
import {Layout} from "../components/layout";
import {useCell} from "../helpers/use-cell";


export function Main(){
    const {transferStore} = useContext(DiContext);
    const transactions = useCell(transferStore.Transfers);
    return <>
        <AddTransferForm/>
    </>
}