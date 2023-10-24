import {Flex} from "antd";
import {AccountSelect} from "../components/account-select";
import {TokenSelect} from "../components/token-select";
import {AmountInput} from "../components/amount-input";
import {TtmLink} from "../components/ttm-link";

export const TransferToMe = () => {
    return <Flex vertical>
        <AccountSelect/>
        <TokenSelect/>
        <AmountInput noMyAmount/>
        <TtmLink/>
    </Flex>
}