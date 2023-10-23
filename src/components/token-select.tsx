import {FunctionalComponent} from "preact";
import {JSXInternal} from "preact/src/jsx";
import {tokens as allTokens} from "@uniswap/default-token-list";
import {useMemo} from "preact/hooks";
import {getTokensByChainId} from "../services/token.info";

export type TokenSelectProps = {
    chainId: number;
    value?: string;
    onChange?(value: string): void;
} & JSXInternal.HTMLAttributes<HTMLSelectElement>;
export const TokenSelect: FunctionalComponent<TokenSelectProps> = ({chainId, onChange, ...selectProps}) => {
    const tokens = useMemo(() => getTokensByChainId(chainId), [chainId]);
    return <select {...selectProps} onChange={e => onChange(e.currentTarget.value)}>
        {tokens.map(t => <option value={t.address}>{t.name}</option>)}
    </select>
};
