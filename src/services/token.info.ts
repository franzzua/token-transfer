import {tokens as allTokens} from "@uniswap/default-token-list";
export function getTokensByChainId(chainId: number){
    return allTokens.filter(x => x.chainId == chainId || chainId in (x.extensions?.bridgeInfo ?? {}))
}

export function getTokenByAddress(tokenAddress: string){
    return allTokens.find(x => x.address == tokenAddress);
}