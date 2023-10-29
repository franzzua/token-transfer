import {TransferApi} from "./services/transfer.api";

export class TransferApiMock extends TransferApi {
    async* run(transfer: Transfer, fee: bigint): AsyncGenerator<Transfer['state']> {
        yield 'pending';
        await new Promise(r => setTimeout(r, 1000));
        yield 'signed';
        await new Promise(r => setTimeout(r, 5000));
        yield 'mined';
    }

    async getBalance(tokenAddress: string): Promise<bigint> {
        return 100500n * (10n ** 18n);
    }

    async estimateGas(tokenAddress: string, to: string, amount: bigint, from: string): Promise<bigint> {
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