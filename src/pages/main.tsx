import {useCell} from "../helpers/use-cell";
import {transactionStore} from "../stores/transaction.store";


export function Main(){
    const transactions = useCell(transactionStore.Transactions);
    return <>
        <table>
            <tbody>
            {transactions.map(x => <tr key={x._id}>
                <td>{x.from}</td>
                <td>{x.to}</td>
                <td>{x.amount} {x.token}</td>
                <td>{x.state}</td>
            </tr>)}
            </tbody>
        </table>

        <button onClick={transactionStore.add}>Add</button>
    </>
}