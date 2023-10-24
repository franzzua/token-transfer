import {FC} from "react";
import {Flex, Typography} from "antd";

export type LabelProps = {
    children: any;
    error?: string | undefined;
    title?: string;
}
export const Label: FC<LabelProps> = (props) => {
    return <Flex vertical gap="4px">
        <Typography>{props.title}</Typography>
        {props.children}
        {props.error && <Typography>{props.error}</Typography>}
    </Flex>
}