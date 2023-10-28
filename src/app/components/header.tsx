import {Card, Flex, Typography} from "antd";
import {AccountSelect} from "./account-select";

export const Header = () => {
    return <Card>
        <Flex vertical gap=".2em" style={{margin: '1em'}} align="center">
            <AccountSelect/>
            <Typography.Text>
                0.48 ETH, 0.34 PNK 8.888 MATIC 0.48 ETH, 0.34 PNK 8.888 MATIC 0.48 ETH, 0.34 PNK 8.888 MATIC 0.48 ETH, 0.34 PNK 8.888 MATIC
            </Typography.Text>
        </Flex>
    </Card>
}