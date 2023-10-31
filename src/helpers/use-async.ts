import {useCell} from "./use-cell";
import {AsyncCell, compare} from "@cmmn/cell/lib";
import {useMemo} from "preact/hooks";

export function useAsync<TResult>(getResult: () => Promise<TResult>, deps: any[]): AsyncResult<TResult>{
    const cell = useMemo(() => {
        return new AsyncCell<AsyncResult<TResult>>(async function* generator() {
            try {
                const result = await getResult();
                yield {isFetching: false, error: undefined, data: result};
            } catch (e) {
                yield {isFetching: false, error: e, data: undefined};
            }
        }, {compare});
    }, deps);
    return useCell(cell) ?? fetchingResult;
}
export type AsyncResult<T> = {
    data: T | undefined;
    error: any | undefined;
    isFetching: boolean;
}
const fetchingResult ={
    data: undefined,
    isFetching: true,
    error: undefined
};