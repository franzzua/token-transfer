import {TransferApi} from "./services/transfer.api";

export class TransferApiMock extends TransferApi {
    async run(tokenAddress: string, to: string, amount: bigint, fee: bigint): Promise<TransferSent> {
        const sentTransfer = {
            tokenAddress: tokenAddress,
            chainId: 1,
            to: to,
            timestamp: +new Date()/1000,
            blockNumber: null,
            initialMaxPriorityFeePerGas: 0n,
            from: 'me',
            maxPriorityFeePerGas: 0n,
            amount,
            state: 'signed',
            blockHash: '',
            nonce: 1,
            _id: undefined,
        } as TransferSent;
        await new Promise(r => setTimeout(r, 1000));
        return sentTransfer;
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