import {Container, InjectionToken} from "@cmmn/cell/lib";
import {BrowserProvider} from "ethers";
import {AppStore} from "./stores/app-store";
import {TransferApi} from "./services/transfer.api";
import {UserStorage} from "./services/userStorage";
import {TokensStore} from "./stores/tokens.store";
import {TransferStore} from "./stores/transfer.store";
import {AccountStore} from "./stores/account.store";
import {TransferApiMock} from "./transferApiMock";
import {ChainStore} from "./stores/chain.store";


export const ProviderInjectionToken = new InjectionToken("provider");
export const IdInjectionToken = new InjectionToken("id");
export const container = Container.withProviders(
    {provide: AppStore, deps: [UserStorage, TransferApi, AccountStore, ChainStore, TokensStore, Container]},
    {provide: AccountStore, deps: []},
    {provide: TransferStore, deps: [IdInjectionToken, UserStorage, AccountStore, TokensStore, TransferApi, ChainStore]},
    {provide: TokensStore, deps: [UserStorage, AccountStore, TransferApi]},
    {provide: TransferApi, deps: [ProviderInjectionToken, AccountStore]},
    {provide: ProviderInjectionToken, useValue: (chainId: number) => new BrowserProvider(window.ethereum, chainId)},
    {provide: ChainStore, deps: [AccountStore]}
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