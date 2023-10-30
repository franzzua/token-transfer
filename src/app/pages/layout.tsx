import {FC} from "react";
import {Header} from "../components/header";

export const Layout: FC<{children: any}> = ({children}) => {
    return <div flex="column" gap="2">
        <Header/>
        <div>
        {children}
        </div>
    </div>
}