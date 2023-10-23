import {Container, InjectionToken} from "@cmmn/cell/lib";
import {BrowserProvider} from "ethers";
import {TransferApi} from "../services/transfer.api";
import {Storage} from "../services/storage";
import {TransfersStore} from "../stores/transfers.store";
import {DiContainer} from "./contexts/app-context";
import {AccountStore} from "../stores/account.store";


export const ProviderInjectionToken = new InjectionToken("provider");
export const container = Container.withProviders(
    {provide: DiContainer, deps: [TransfersStore, Storage, TransferApi, AccountStore]},
    {provide: TransfersStore, deps: [Storage, TransferApi]},
    {provide: TransferApi, deps: [ProviderInjectionToken]},
    {provide: ProviderInjectionToken, useFactory: () => new BrowserProvider(window.ethereum)}
);