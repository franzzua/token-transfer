import {Container, InjectionToken} from "@cmmn/cell/lib";
import {BrowserProvider, randomBytes, toBeHex, toBigInt} from "ethers";
import {TransferApi} from "./services/transfer.api";
import {Storage} from "./services/storage";
import {TransferStore} from "./stores/transfer.store";
import {TransfersStore} from "./stores/transfers.store";
import {DiContainer} from "./app/contexts/app-context";
import {AccountStore} from "./stores/account.store";
import {TransferApiMock} from "./transferApiMock";
import {ChainStore} from "./stores/chain.store";
import {EtherscanApi} from "./services/etherscanApi";


export const ProviderInjectionToken = new InjectionToken("provider");
export const IdInjectionToken = new InjectionToken("id");
export const container = Container.withProviders(
    {provide: DiContainer, deps: [TransfersStore, Storage, TransferApi, AccountStore, ChainStore, Container]},
    {provide: AccountStore, deps: []},
    {provide: TransfersStore, deps: [Storage, TransferApi, AccountStore]},
    {provide: TransferStore, deps: [IdInjectionToken, TransfersStore, Storage, TransferApi, ChainStore]},
    {provide: TransferApi, deps: [ProviderInjectionToken, AccountStore]},
    {provide: ProviderInjectionToken, useValue: (chainId: number) => new BrowserProvider(window.ethereum, chainId)},
    {provide: ChainStore, deps: [EtherscanApi, AccountStore, ProviderInjectionToken]}
);

// @ts-ignore
if (globalThis.DEBUG){
    // container.provide([{
    //     provide: AccountStore, useValue: {
    //         accounts: [
    //             toBeHex(toBigInt(randomBytes(20))),
    //             toBeHex(toBigInt(randomBytes(20))),
    //             toBeHex(toBigInt(randomBytes(20))),
    //             toBeHex(toBigInt(randomBytes(20))),
    //         ],
    //         chainId: 137
    //     }
    // }, {
    //     provide: TransferApi, useClass: TransferApiMock, deps: [ProviderInjectionToken]
    // }])
}