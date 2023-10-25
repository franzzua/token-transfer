import uniswapTokenList from "@uniswap/default-token-list";

const allTokens = uniswapTokenList.tokens as Array<TokenInfo>
export function getTokensByChainId(chainId: number){
    return allTokens.filter(x =>
        x.chainId == chainId
    );
}

export function getTokenByAddress(tokenAddress: string){
    return allTokens.find(x => x.address == tokenAddress);
}
export type TokenInfo = {
    chainId: number;
    address: string;
    symbol: string;
    name: string;
    logoURI: string;
    decimals: number;
    extensions?: {
        bridgeInfo: Record<string, {
            tokenAddress: string;
        }>
    }
}