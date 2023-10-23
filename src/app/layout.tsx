import {FC} from "react";

export const Layout: FC<{children: any}> = ({children}) => {
    return <div>
        {children}
    </div>
}