import {Container, InjectionToken} from "@cmmn/cell/lib";
import {BrowserProvider} from "ethers";
import {TransferApi} from "../services/transfer.api";
import {TransferStorage} from "../services/transfer.storage";
import {TransfersStore} from "../stores/transfers.store";
import {DiContainer} from "../contexts/app-context";
import {AccountStore} from "../stores/account.store";


export const ProviderInjectionToken = new InjectionToken("provider");
export const container = Container.withProviders(
    {provide: DiContainer, deps: [TransfersStore, TransferStorage, TransferApi, AccountStore]},
    {provide: TransfersStore, deps: [TransferStorage, TransferApi]},
    {provide: TransferApi, deps: [ProviderInjectionToken]},
    {provide: ProviderInjectionToken, useFactory: () => new BrowserProvider(window.ethereum)}
);