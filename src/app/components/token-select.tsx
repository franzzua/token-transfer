import {Image, Select, Flex} from "antd";
import {BaseOptionType} from "antd/es/select";
import {FC, useContext, useEffect} from "react";
import {useMemo} from "react";
import {AppContext} from "../contexts/app-context";
import {TransferContext} from "../contexts/transfer-context";
import {useCell} from "../../helpers/use-cell";
import {getTokensByChainId, TokenInfo} from "../../services/token.info";
import {Label} from "../elements/label";

const TypedSelect = Select<TokenInfo, TokenInfo & BaseOptionType>;

export const TokenSelect: FC = () => {
    const {accountStore} = useContext(AppContext);
    const transferStore = useContext(TransferContext);
    const chainId = useCell(() => accountStore.chainId);
    const transfer = useCell(() => transferStore.Transfer);
    const tokens = useMemo(() => getTokensByChainId(chainId), [chainId]);
    const options = tokens.map(t => ({
        ...t,
        value: t.address,
        key: t.address,
        label: <Flex gap="1em" >
            <Image width="2em" height="2em" src={t.logoURI}/>
            {t.name}
        </Flex>
    } as TokenInfo & BaseOptionType))
    const selected = options.find(x => x.address === transfer.tokenAddress);
    useEffect(() => {
        if (selected?.address !== transfer.tokenAddress)
            transferStore.patch({tokenAddress: selected?.address});
    }, [selected?.address]);
    return <Label title="Token">
        <TypedSelect showSearch={tokens.length > 5}
                       value={selected}
                       options={options}
                       filterOption={(q, o) => o.name.toLowerCase().includes(q.toLowerCase())}
                       optionFilterProp="children"
                       onSelect={(_, token) => transferStore.patch({ tokenAddress: token.address })}>
        </TypedSelect>
    </Label>;
};
