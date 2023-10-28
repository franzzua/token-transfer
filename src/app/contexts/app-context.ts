import {createContext} from "react";
import {AppStore} from "../../stores/app-store";

export const AppContext = createContext<AppStore>(null);

