import {JSX} from "preact";
import {useCallback, useContext} from "preact/hooks";
import {TransferContext} from "../contexts/transfer-context";
import {useCell} from "../helpers/use-cell";
import {Label} from "../elements/label";

export const TargetInput = () => {
    const transferStore = useContext(TransferContext);
    const transfer = useCell(() => transferStore.Transfer);
    const error = useCell(() => transferStore.errors.to);
    const onInput = useCallback<JSX.GenericEventHandler<HTMLInputElement>>(
        e => transferStore.patch({to: e.currentTarget.value}),
        []
    )
    return <Label title="To" error={error}>
        <input value={transfer.to ?? ''}
               tabIndex={2}
               placeholder="Receiver address"
               className={['control', error ? 'error' : ''].filter(x => x).join(' ')}
               onInput={onInput}/>
    </Label>;
}