import {Card, Flex} from "antd";
import {TokenSelect} from "../components/token-select";
import {AmountInput} from "../components/amount-input";
import {TtmLink} from "../components/ttm-link";

export const TransferToMe = () => {
    return <Card>
        <Flex vertical>
            <TokenSelect/>
            <AmountInput noMyAmount/>
            <TtmLink/>
        </Flex>
    </Card>
}