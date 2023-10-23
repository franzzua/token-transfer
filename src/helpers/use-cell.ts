import { BaseCell, Cell, compare } from "@cmmn/cell/lib";
import {useMemo, useReducer, useEffect} from "react";

export function useCell<T>(
    getter: (() => T) | BaseCell<T> | undefined,
    deps: any[] = []
): T {
    if (!getter || getter instanceof BaseCell)
        deps.push(getter);
    const cell = useMemo<BaseCell>(
        () => getter instanceof BaseCell ? getter : new Cell(getter, {compare}),
        deps
    );
    const [, dispatch] = useReducer(x => ({}), {});
    useEffect(() => {
        dispatch();
        return cell.on('change', dispatch);
    }, [cell])
    return cell.get();
}
