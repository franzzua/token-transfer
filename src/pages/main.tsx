import {useContext} from "preact/compat";
import {DiContext} from "../app/di-context";
import {AddTransferForm} from "../components/add-transfer-form";
import {Layout} from "../components/layout";
import {useCell} from "../helpers/use-cell";


export function Main(){
    const {transactionStore} = useContext(DiContext);
    const transactions = useCell(transactionStore.Transactions);
    return <>
        <table>
            <tbody>
            {transactions.map(x => <tr key={x._id}>
                <td>{x.from}</td>
                <td>{x.to}</td>
                <td>{x.amount} {x.tokenAddress}</td>
                <td>{x.state}</td>
            </tr>)}
            </tbody>
        </table>

        <button onClick={transactionStore.add}>Add</button>
        <AddTransferForm/>
    </>
}