import {Flex} from "antd";
import {FC} from "react";
import {Header} from "../components/header";

export const Layout: FC<{children: any}> = ({children}) => {
    return <Flex vertical gap="2em" justify="space-around" >
        <Flex justify="center">
            <Header/>
        </Flex>
        <div>
        {children}
        </div>
    </Flex>
}