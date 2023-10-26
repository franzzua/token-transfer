import {FC} from "react";

export const Layout: FC<{children: any}> = ({children}) => {
    return <div style={{margin: '1vh 1vw'}}>
        {children}
    </div>
}