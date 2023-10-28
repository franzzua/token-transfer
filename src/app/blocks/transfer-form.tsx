import {Button, Card, Flex, Skeleton} from "antd";
import {TransferStore} from "../../stores/transfer.store";
import {TransferContext} from "../contexts/transfer-context";
import {TargetInput} from "../components/target-input";
import {TokenSelect} from "../components/token-select";
import { useContext} from "react";
import {useCell} from "../../helpers/use-cell";
import {AmountInput} from "../components/amount-input";
import {goTo} from "../routing";
import {FeeSelect} from "../components/fee-select";

export const TransferForm = () => {
    const transferStore = useContext(TransferContext) as TransferStore;
    const transfer = useCell(() => transferStore.Transfer);
    if (!transfer) //TODO: add loader
        return <Skeleton/>;
    return <Card style={{maxWidth: 600, margin: 'auto'}} title={"Send tokens"}>
        <Flex vertical gap="1em">
            <TokenSelect />
            <AmountInput />
            <TargetInput />
            <FeeSelect />

            <Button.Group>
                <Button onClick={() => goTo("/main")}>Cancel</Button>
                <Button type="primary" onClick={async () => {
                    transferStore.send();
                    goTo("/main")
                }}>Send</Button>
            </Button.Group>
        </Flex>
    </Card>;
}