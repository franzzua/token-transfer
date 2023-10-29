import {BaseOptionType} from "antd/es/select";
import {FC, useMemo, useState} from "react";
import {useCell} from "../../helpers/use-cell";
import {useAppContext} from "../contexts";
import {useAsync} from "../../helpers/use-async";
import {isAddress} from "ethers";

export type TokenSelectProps = {
    value: TokenInfo;
    onChange(value?: TokenInfo): void;
}
export const TokenSelect: FC<TokenSelectProps> = (props) => {
    const {tokensStore} = useAppContext();
    const tokens = useCell(() => tokensStore.tokens);
    const [query, setQuery] = useState('');
    const filteredTokens = useMemo(() =>
            tokens.filter(t => filter(query, t)),
        [query, tokens]
    );
    const tokenByAddress = useAsync<TokenInfo | null>(() => {
        if (filteredTokens.length > 0) return null;
        if (!isAddress(query)) return null;
        return tokensStore.getTokenInfo(query);
    }, [filteredTokens.length, query]);
    return <div flex="row" style={{maxHeight: '30vh', overflow: 'auto', width: '100%', background: 'var(--light-blue)'}}
                justify="around" wrap="wrap" gap="1">
        <div style={{flex: '0 0 100%'}} flex="row">
            <svg viewBox="-.2 -.2 2.6 2.6" stroke="currentColor" strokeWidth=".3"
                 className="pre-input" fill="none">
                <path d="M1.7 1.7 L 2.4 2.4"/>
                <circle cx="1" cy="1" r="1"/>
            </svg>
            <input value={query}
                   placeholder="Search tokens by name, symbol or address"
                   onChange={e => setQuery(e.currentTarget.value)}
                   />
        </div>
        {filteredTokens.concat(tokenByAddress.data).filter(x => x)
            .map(t => <TokenPreview onChange={props.onChange}
                                    isSelected={props.value.address == t.address}
                                    token={t}
                                    key={t.address ?? t.symbol}/>)}
        {tokenByAddress.isFetching && 'Loading...'}
    </div>;
};

const TokenPreview: FC<{
    token: TokenInfo;
    isSelected: boolean;
    onChange(token: TokenInfo): void;
}> = ({token, onChange, isSelected}) => <div flex="column" align="center" style={{
    cursor: 'pointer',
    background: isSelected ? 'var(--light-blue)' : 'transparent'
}} onClick={() => onChange(token)}>
    <img alt={token.name} src={token.logoURI} style={{
        width: '4em',
        height: '4em'
    }}/>
    <span>{token.symbol}</span>
</div>;

function filter(query: string, token: TokenInfo & BaseOptionType){
    return [
        token.name?.toLowerCase(),
        token.address?.toLowerCase(),
        token.symbol?.toLowerCase(),
        token.value?.toLowerCase(),
    ].some(x => x?.includes(query.toLowerCase()));
}