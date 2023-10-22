import {Container, InjectionToken} from "@cmmn/cell/lib";
import {BrowserProvider} from "ethers";
import {TransferApi} from "../services/transfer.api";
import {TransferStorage} from "../services/transfer.storage";
import {TransactionStore} from "../stores/transaction.store";
import {DiContainer} from "./di-context";


export const ProviderInjectionToken = new InjectionToken("provider");
export const container = Container.withProviders(
    {provide: TransactionStore, deps: [TransferStorage, TransferApi]},
    {provide: DiContainer, deps: [TransactionStore]},
    {provide: TransferApi, deps: [ProviderInjectionToken]},
    {provide: ProviderInjectionToken, useFactory: () => new BrowserProvider(window.ethereum)}
);