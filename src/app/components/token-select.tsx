import {Image, Flex, AutoComplete, Typography} from "antd";
import {BaseOptionType} from "antd/es/select";
import {FC, useContext, useEffect, useState} from "react";
import {useMemo} from "react";
import {AppContext} from "../contexts/app-context";
import {TransferContext} from "../contexts/transfer-context";
import {useCell} from "../../helpers/use-cell";
import {getTokensByChainId, TokenInfo} from "../../services/token.info";
import {Label} from "../elements/label";
import {isAddress} from "ethers";

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
        label: <Flex gap="1em" justify="space-between" >
            <Image width="2em" height="2em" src={t.logoURI}/>
            <Typography.Text>{t.name}</Typography.Text>
            <Typography.Text className="text-xs" type="secondary" copyable>{t.address}</Typography.Text>
            <Typography.Text strong>{t.symbol}</Typography.Text>
        </Flex>
    } as BaseOptionType));
    const tokenInfo = useCell(transferStore.TokenInfo);
    const selected = options.find(x => x.value === transfer.tokenAddress) ?? {
        ...tokenInfo,
        value: transfer.tokenAddress,
        key: transfer.tokenAddress,
        label: transfer.tokenAddress,
    };
    const [localValue, setLocalValue] = useState(selected);
    useEffect(() => {
        if (selected?.value !== transfer.tokenAddress)
            transferStore.patch({tokenAddress: selected?.value});
    }, [selected?.value]);
    console.log(localValue, selected);
    return <Label title="Token">
        <AutoComplete showSearch={tokens.length > 5}
                      value={localValue}
                      allowClear
                      onClear={() => transferStore.patch({tokenAddress: null})}
                      options={options}
                      filterOption={filter}
                      onChange={(value,option) => {
                          console.log(value, option);
                          setLocalValue(value);
                          if (isAddress(value)) {
                              transferStore.patch({ tokenAddress: value })
                          }
                      }}>
        </AutoComplete>
    </Label>;
};

function filter(query: string, token: TokenInfo & BaseOptionType){
    return [
        token.name?.toLowerCase(),
        token.address?.toLowerCase(),
        token.symbol?.toLowerCase(),
        token.value?.toLowerCase(),
    ].some(x => x?.includes(query.toLowerCase()));
}