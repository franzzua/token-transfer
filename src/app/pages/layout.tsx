import {FC} from "react";
import {Header} from "../components/header";
import style from "./layout.module.less";
export const Layout: FC<{children: any}> = ({children}) => {
    return <div className={style.layout}>
        <Header/>
        <div className={style.content}>
        {children}
        </div>
    </div>
}