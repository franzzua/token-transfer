import {Container, InjectionToken} from "@cmmn/cell/lib";
import {BrowserProvider} from "ethers";
import {TransferApi} from "../services/transfer.api";
import {TransferStorage} from "../services/transfer.storage";
import {TransferStore} from "../stores/transfer.store";
import {DiContainer} from "./di-context";
import {AccountStore} from "../stores/account.store";


export const ProviderInjectionToken = new InjectionToken("provider");
export const container = Container.withProviders(
    {provide: TransferStore, deps: [TransferStorage, TransferApi]},
    {provide: DiContainer, deps: [TransferStore, AccountStore]},
    {provide: TransferApi, deps: [ProviderInjectionToken]},
    {provide: ProviderInjectionToken, useFactory: () => new BrowserProvider(window.ethereum)}
);