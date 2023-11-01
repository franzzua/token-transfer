import {FunctionalComponent, JSX} from "preact";
import {useCallback} from "preact/hooks";
import {useCell} from "../helpers/use-cell";
import {Label} from "../elements/label";

export const TargetInput: FunctionalComponent<{store: TargetInputStore}> = ({store}) => {
    const transfer = useCell(() => store.Transfer);
    const error = useCell(() => store.errors.to);
    const onInput = useCallback<JSX.GenericEventHandler<HTMLInputElement>>(
        e => store.patch({to: e.currentTarget.value}),
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

export interface TargetInputStore {
    get Transfer(): Pick<Transfer, "to">;
    get errors(): {to: string | null};
    patch(diff: Pick<Transfer, "to">): void;
}