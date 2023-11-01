import {FunctionComponent} from "preact";
import {useContext} from "preact/hooks";
import {AppContext} from "../contexts/app-context";
import {useCell} from "../helpers/use-cell";
import {Select} from "../elements/select";

export const AccountSelect: FunctionComponent = () => {
    const {accountStore} = useContext(AppContext);
    const accounts = useCell(() => accountStore.accounts);
    const me = useCell(() => accountStore.me);
    return (
        <div flex="column" className="frost-card small" align="start">
            <Select value={me}>
                <div flex="column" gap="0.5">
                    <div></div>
                    {accounts.filter(x => x !== me).map(x =>
                        <button className="text" onClick={e => accountStore.me = x} key={x}>
                            {x}
                        </button>
                    )}
                    <div></div>
                </div>
            </Select>
        </div>
    );
}