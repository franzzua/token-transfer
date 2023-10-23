import { BaseCell, Cell, compare } from "@cmmn/cell/lib";
import {useMemo, useSyncExternalStore, useCallback} from "react";

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
    const getSnapshot = useCallback(() => cell.get(), [cell]);
    const subscribe = useCallback<Subscribe>(onChange => cell.on('change', onChange), [cell]);
    return useSyncExternalStore(subscribe, getSnapshot);
}

type Subscribe = (onStoreChange: () => void) => () => void;