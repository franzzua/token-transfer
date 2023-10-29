import {Fn} from "@cmmn/cell/lib";
import type {Block, TransactionResponse} from "ethers";
import {ObservableDB} from "../../helpers/observableDB";
import {ethereumSw} from "./ethereum-sw";
export class TransactionReader {

    constructor() {
        ethereumSw.connector.on('connected', () => this.start());
        ethereumSw.connector.on('disconnected', () => this.stop());
    }

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
        await this.preload();
        while (this.isConnected){
            // if chain is changed we should load again 4 blocks from new chain
            if (startChainId !== await ethereumSw.getChainId()){
                this.isConnected = false;
                return this.start();
            }
            await this.removeOld();
            try {
                const blockNumber = await ethereumSw.request({
                    method: 'eth_blockNumber'
                });
                await this.readBlock(+blockNumber);
            }catch (e){
                // OK, let's try to wait, maybe limits are exceeded
                await Fn.asyncDelay(5000);
            }
            await Fn.asyncDelay(1000);
        }
    }

    public async stop(){
        console.log('stop read transactions');
        this.isConnected = false;
        await Fn.asyncDelay(2000);
    }

    private async removeOld(){
        for (let transaction of this.storage.toArray()) {
            if (transaction.timestamp > +new Date()/1000 - TRANSACTION_WINDOW) continue;
            await this.storage.remove(transaction._id);
        }
    }

    private async readTransaction(transactionOrHash: string | TransactionResponse): Promise<TransactionResponse | null>{
        if (typeof transactionOrHash === "string"){
            if (this.storage.get(transactionOrHash)) return null;
            return ethereumSw.request<TransactionResponse>({
                method: 'eth_getTransactionByHash',
                params: [transactionOrHash],
            });
        }
        if (this.storage.get(transactionOrHash.hash)) return null;
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
            const data = {
                _id: transaction.hash,
                type: transaction.type,
                chainId: Number(await ethereumSw.getChainId()),
                maxPriorityFeePerGas: BigInt(transaction.maxPriorityFeePerGas),
                timestamp: Number(block.timestamp)
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
};