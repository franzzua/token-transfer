import {isAddress} from "ethers/address";
import {FunctionComponent} from "preact";
import {useMemo, useState} from "preact/hooks";
import {useAppContext} from "../../contexts";
import {useAsync} from "../../helpers/use-async";
import {useCell} from "../../helpers/use-cell";
import {SearchIcon} from "./search-icon";
import {TokenPreview} from "./token-preview";

export type TokenSelectProps = {
    value: TokenInfo;
    onChange(value?: TokenInfo): void;
}
export const TokenSelect: FunctionComponent<TokenSelectProps> = (props) => {
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
            <SearchIcon/>
            <input value={query}
                   placeholder="Search tokens by name, symbol or address"
                   onInput={e => setQuery(e.currentTarget.value)}
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

function filter(query: string, token: TokenInfo){
    return [
        token.name?.toLowerCase(),
        token.address?.toLowerCase(),
        token.symbol?.toLowerCase(),
    ].some(x => x?.includes(query.toLowerCase()));
}