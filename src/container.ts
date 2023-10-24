import {Container, InjectionToken} from "@cmmn/cell/lib";
import {DefaultReturnType} from "erc20-compiled/dist/typings/types/common";
import {BrowserProvider, FeeData} from "ethers";
import {TransferApi} from "./services/transfer.api";
import {Storage} from "./services/storage";
import {Transfer} from "./stores/transfer.store";
import {Transfer, TransfersStore} from "./stores/transfers.store";
import {DiContainer} from "./app/contexts/app-context";
import {AccountStore} from "./stores/account.store";


export const ProviderInjectionToken = new InjectionToken("provider");
export const container = Container.withProviders(
    {provide: DiContainer, deps: [TransfersStore, Storage, TransferApi, AccountStore]},
    {provide: TransfersStore, deps: [Storage, TransferApi]},
    {provide: TransferApi, deps: [ProviderInjectionToken]},
    {provide: ProviderInjectionToken, useFactory: () => new BrowserProvider(window.ethereum)}
);

// @ts-ignore
if (DEBUG){
    container.provide([{
        provide: AccountStore, useValue: {
            accounts: ['Alice', 'Bob'],
            chainId: 1
        }
    }, {
        provide: TransferApi, useValue: {
            async* run(transfer: Transfer): AsyncGenerator<Transfer> {
                yield {...transfer, state: 'pending'};
                await new Promise(r => setTimeout(r, 1000));
                yield {...transfer, state: 'signed'};
                await new Promise(r => setTimeout(r, 5000));
                yield {...transfer, state: 'mined'};
            },
            async getBalance(tokenAddress: string, from: string): Promise<bigint> {
                return 100500n*(10n**18n);
            },
            async estimateGas(transfer: Transfer): Promise<bigint> {
                return 12345n;
            },
            async getFeeData(): Promise<FeeData> {
                return {
                    maxFeePerGas: 54321n,
                    gasPrice: 5454n,
                    maxPriorityFeePerGas: 54300n,
                    toJSON(): any {
                      return this;
                    }
                };
            }
        } as TransferApi
    }])
}