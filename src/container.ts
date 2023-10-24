import {Container, InjectionToken} from "@cmmn/cell/lib";
import {BrowserProvider, randomBytes, toBeHex, toBigInt} from "ethers";
import {TransferApi} from "./services/transfer.api";
import {Storage} from "./services/storage";
import {TransfersStore} from "./stores/transfers.store";
import {DiContainer} from "./app/contexts/app-context";
import {AccountStore} from "./stores/account.store";
import {TransferApiMock} from "./transferApiMock";
import {ChainStore} from "./stores/chain.store";
import {EtherscanApi} from "./services/etherscanApi";


export const ProviderInjectionToken = new InjectionToken("provider");
export const container = Container.withProviders(
    {provide: DiContainer, deps: [TransfersStore, Storage, TransferApi, AccountStore, ChainStore]},
    {provide: AccountStore, deps: [TransferApi]},
    {provide: TransfersStore, deps: [Storage, TransferApi, AccountStore]},
    {provide: TransferApi, deps: [ProviderInjectionToken]},
    {provide: ProviderInjectionToken, useFactory: () => new BrowserProvider(window.ethereum)},
    {provide: ChainStore, deps: [EtherscanApi]}
);

// @ts-ignore
if (DEBUG){
    container.provide([{
        provide: AccountStore, useValue: {
            accounts: [
                toBeHex(toBigInt(randomBytes(20))),
                toBeHex(toBigInt(randomBytes(20))),
                toBeHex(toBigInt(randomBytes(20))),
                toBeHex(toBigInt(randomBytes(20))),
            ],
            chainId: 1
        }
    }, {
        provide: TransferApi, useClass: TransferApiMock, deps: [ProviderInjectionToken]
    }])
}