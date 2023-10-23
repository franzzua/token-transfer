import {Image, Select, SelectProps, Flex} from "antd";
import {BaseOptionType} from "antd/es/select";
import {FC, useEffect} from "react";
import {useMemo} from "react";
import {getTokensByChainId, TokenInfo} from "../services/token.info";

const TypedSelect = Select<TokenInfo, TokenInfo & BaseOptionType>;

export type TokenSelectProps = {
    chainId: number;
    value?: string;
    onChange?(value: string): void;
} & Omit<SelectProps<TokenInfo, TokenInfo & BaseOptionType>, "onSelect"|"value">;
export const TokenSelect: FC<TokenSelectProps> = ({chainId,value, onChange, ...selectProps}) => {
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
    const selected = options.find(x => x.address === value);
    useEffect(() => {
        if (selected?.address !== value)
            onChange(selected?.address);
    }, [selected?.address]);
    return <TypedSelect showSearch={tokens.length > 5}
                        {...selectProps}
                        value={selected}
                        options={options}
                        filterOption={(q, o) => o.name.toLowerCase().includes(q.toLowerCase())}
                        optionFilterProp="children"
                        onSelect={(_,token) => onChange(token.address)}>
    </TypedSelect>;
};
