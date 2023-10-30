import {Fn} from "@cmmn/cell/lib";
import type {Block, TransactionResponse} from "ethers";
import {ObservableDB} from "../../helpers/observableDB";
import {Contract, InfuraProvider, JsonRpcApiProvider, WebSocketProvider} from "ethers";
import {ethereumSw} from "./ethereum-sw";
export class TransactionReader {

    constructor() {

        ethereumSw.connector.on('connected', () => this.start());
        ethereumSw.connector.on('disconnected', () => this.stop());
    }
    private infuraProvider: WebSocketProvider;
    private storage = new ObservableDB<TransactionInfo>("transactions");
    private isConnected = false;

    public async start(){
        if (this.isConnected) {
            console.log('transactions are reading already');
            return;
        }
        console.log('start read transactions')
        this.isConnected = true;
        const startChainId = await ethereumSw.getChainId();
        this.infuraProvider = InfuraProvider.getWebSocketProvider(+startChainId);
        await this.infuraProvider.on('pending', this.onPending);
        await this.infuraProvider.on('block', this.onBlock);

        await this.preload();
        while (this.isConnected){
            // if chain is changed we should load again 4 blocks from new chain
            if (startChainId !== await ethereumSw.getChainId()){
                await this.stop();
                return this.start();
            }
            await this.removeOld();
            await Fn.asyncDelay(1000);
            // try {
            //     const blockNumber = await ethereumSw.request({
            //         method: 'eth_blockNumber'
            //     });
            //     await this.readBlock(+blockNumber);
            // }catch (e){
            //     // OK, let's try to wait, maybe limits are exceeded
            //     await Fn.asyncDelay(5000);
            // }
            // await Fn.asyncDelay(1000);
        }
    }

    public async stop(){
        console.log('stop read transactions');
        this.isConnected = false;
        await this.infuraProvider.off('pending', this.onPending);
        await this.infuraProvider.off('block', this.onBlock);
        await Fn.asyncDelay(2000);
    }

    private onBlock = (blockId: number) => {
        return this.readBlock(blockId, true);
    };
    private onPending = async txhash => {
        // const transaction = await this.readTransaction(txhash);
        // if (!transaction) return;
        return this.storage.addOrUpdate({
            _id: txhash,
            // chainId: transaction.chainId,
            // blockHash: transaction.blockHash,
            pendingTime: +new Date() / 1000
        } as any);
    };

    private async removeOld(){
        for (let transaction of this.storage.toArray()) {
            if (transaction.pendingTime > +new Date()/1000 - TRANSACTION_WINDOW*10) continue;
            if (transaction.timestamp > +new Date()/1000 - TRANSACTION_WINDOW) continue;
            await this.storage.remove(transaction._id);
        }
    }

    private async readTransaction(transactionOrHash: string | TransactionResponse): Promise<TransactionResponse | null>{
        if (typeof transactionOrHash === "string"){
            if (this.storage.get(transactionOrHash)?.timestamp) return null;
            return ethereumSw.request<TransactionResponse>({
                method: 'eth_getTransactionByHash',
                params: [transactionOrHash],
            });
        }
        if (this.storage.get(transactionOrHash.hash)?.timestamp) return null;
        return transactionOrHash;
    }

    private async readBlock(number: number, withTransactions = false){
        const block = await ethereumSw.request<Block & {
            transactions: Array<string | TransactionResponse>;
        }>({
            method: 'eth_getBlockByNumber',
            params: ['0x'+number.toString(16), withTransactions],
        });
        // console.log(`There are ${block.transactions.length} transactions in block ${number}`);
        if (!block) return;
        for (let transactionOrHash of block.transactions) {
            if (!this.isConnected) return;
            const transaction = await this.readTransaction(transactionOrHash)
            if (!transaction?.maxPriorityFeePerGas) continue;
            const existed = this.storage.get(transaction.hash);
            const data = {
                ...existed,
                _id: transaction.hash,
                type: transaction.type,
                chainId: Number(await ethereumSw.getChainId()),
                maxPriorityFeePerGas: BigInt(transaction.maxPriorityFeePerGas),
                timestamp: +new Date()/1000,//Number(block.timestamp)
            };
            await this.storage.addOrUpdate(data);
        }
        return block.transactions.length;
    }
    private async preload(){
        try {
            const blockNumber = await ethereumSw.request({
                method: 'eth_blockNumber'
            });
            for (let i = 0, readTransactionsCount = 0; i < 128 && readTransactionsCount < 300; i++) {
                readTransactionsCount += await this.readBlock(+blockNumber - i, true);
            }
        } catch (e){
            console.error(e);
        }
    }

}

export type TransactionInfo = Pick<TransactionResponse, "maxPriorityFeePerGas"|"type"> & {
    _id: string;
    timestamp: number;
    chainId: number;
    pendingTime?: number;
};