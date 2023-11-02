import {Container, InjectionToken} from "@cmmn/cell/lib";
import {providers} from "ethers";

export const ProviderInjectionToken = new InjectionToken("provider");
export const IdInjectionToken = new InjectionToken("id");
export const container = Container.withProviders(
    {
        provide: ProviderInjectionToken,
        useValue: (chainId: number) => new providers.Web3Provider(window.ethereum as any, chainId)
    },
);
