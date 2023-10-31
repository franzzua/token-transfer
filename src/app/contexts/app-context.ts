import {createContext} from "preact";
import {AppStore} from "../../stores/app-store";

export const AppContext = createContext<AppStore>(null);

