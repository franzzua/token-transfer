import {Image, Flex, Input} from "antd";
import {BaseOptionType} from "antd/es/select";
import {FC, useMemo, useState} from "react";
import {useCell} from "../../helpers/use-cell";
import {useAppContext} from "../contexts";

export type TokenSelectProps = {
    value: TokenInfo;
    onChange(value?: TokenInfo): void;
}
export const TokenSelect: FC<TokenSelectProps> = (props) => {
    const {tokensStore} = useAppContext();
    const tokens = useCell(() => tokensStore.tokens);
    const [query, setQuery] = useState('');
    const filteredTokens = useMemo(() => tokens.filter(t => filter(query, t)), [query, tokens]);
    return <Flex style={{maxHeight: '30vh', overflow: 'auto'}} justify="space-around" wrap="wrap" gap="1em">
        <Input.Search value={query}
                      onChange={e => setQuery(e.currentTarget.value)}
                      style={{width: '100%'}}/>
        {filteredTokens.map(t => <TokenPreview onChange={props.onChange}
                                               isSelected={props.value.address == t.address}
                                               token={t}
                                               key={t.address ?? t.symbol}/>)}
        {filteredTokens.length == 0 && `Unknown token, do you want to add it?`}
    </Flex>;
};

const TokenPreview: FC<{
    token: TokenInfo;
    isSelected: boolean;
    onChange(token: TokenInfo): void;
}> = ({token, onChange, isSelected}) => <Flex vertical align="center" style={{
    cursor: 'pointer',
    background: isSelected ? 'var(--light-blue)' : 'transparent'
}} onClick={() => onChange(token)}>
    <Image preview={false} width="4em" height="4em" src={token.logoURI}/>
    <span>{token.symbol}</span>
</Flex>;

function filter(query: string, token: TokenInfo & BaseOptionType){
    return [
        token.name?.toLowerCase(),
        token.address?.toLowerCase(),
        token.symbol?.toLowerCase(),
        token.value?.toLowerCase(),
    ].some(x => x?.includes(query.toLowerCase()));
}