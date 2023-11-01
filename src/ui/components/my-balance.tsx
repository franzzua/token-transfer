import {FunctionComponent} from "preact";

export const MyBalance: FunctionComponent<{balance: string}> = ({balance}) => {
    if (balance == null)
        return <>Loading balance...</>
    return <span>Balance: {balance}</span>;
}