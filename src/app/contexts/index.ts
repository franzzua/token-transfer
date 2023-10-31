import {useContext} from "preact/hooks";
import {AppContext} from "./app-context";

export function useAppContext(){
    return useContext(AppContext);
}