import {TransferApi} from "./services/transfer.api";
import {Transfer} from "./stores/transfers.store";

export class TransferApiMock extends TransferApi {
    async* run(transfer: Transfer): AsyncGenerator<Transfer> {
        yield { ...transfer, state: 'pending' };
        await new Promise(r => setTimeout(r, 1000));
        yield { ...transfer, state: 'signed' };
        await new Promise(r => setTimeout(r, 5000));
        yield { ...transfer, state: 'mined' };
    }

    async getBalance(tokenAddress: string, from: string): Promise<bigint> {
        return 100500n * (10n ** 18n);
    }

    async estimateGas(transfer: Transfer): Promise<bigint> {
        return 12345n;
    }

    // async getFeeData(): Promise<FeeData> {
    //     return {
    //         maxFeePerGas: toBigInt(randomBytes(5)),
    //         gasPrice: toBigInt(randomBytes(5)),
    //         maxPriorityFeePerGas: toBigInt(randomBytes(5)),
    //         toJSON(): any {
    //           return this;
    //         }
    //     };
    // }
}