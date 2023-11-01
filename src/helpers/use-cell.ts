import {compare, throttle} from "@cmmn/cell/lib";
import { BaseCell, Cell } from "@cmmn/cell/lib";
import {useMemo, useReducer, useEffect} from "preact/hooks";

export function useCell<T>(
    getter: (() => T) | BaseCell<T> | undefined,
    deps: any[] = [],
    options: {
        throttle?: number;
    } = {}
): T {
    if (!getter || getter instanceof BaseCell)
        deps.push(getter);
    const cell = useMemo<BaseCell>(
        () => getter instanceof BaseCell ? getter : new Cell(getter, {compare}),
        deps
    );
    const [, dispatch] = useReducer(x => ({}), {});
    useEffect(() => {
        dispatch(cell.get());
        return cell.on('change', options.throttle ? throttle(dispatch, options.throttle, {
            leading: true,
            trailing: true
        }) : dispatch);
    }, [cell])
    return cell.get();
}
