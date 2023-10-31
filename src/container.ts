import {Container, InjectionToken} from "@cmmn/cell/lib";
import {BrowserProvider} from "ethers/providers";

export const ProviderInjectionToken = new InjectionToken("provider");
export const container = Container.withProviders(
    {
        provide: ProviderInjectionToken,
        useValue: (chainId: number) => new BrowserProvider(window.ethereum, chainId)
    },
);
