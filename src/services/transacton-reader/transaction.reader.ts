import {Fn} from "@cmmn/cell/lib";
import type {Block, TransactionResponse} from "ethers";
import {ObservableDB} from "../../helpers/observableDB";
import {InfuraProvider, WebSocketProvider, BrowserProvider} from "ethers";
import {ethereumSw} from "./ethereum-sw";
export class TransactionReader {

    constructor() {

        ethereumSw.connector.on('connected', () => this.start());
        ethereumSw.connector.on('disconnected', () => this.stop());
    }
    private infuraProvider: WebSocketProvider;
    private browserProvider: BrowserProvider;
    private pendingTransactions = new ObservableDB<TransactionInfo>("pendingTransactions");
    private storage = new ObservableDB<TransactionInfo>("transactions");
    private sentTransfers = new ObservableDB<TransferSent>("sentTransfers");
    private isConnected = false;

    public async start(){
        await this.removeOld();
        if (this.isConnected) {
            console.log('transactions are reading already');
            return;
        }
        console.log('start read transactions')
        this.isConnected = true;
        await this.removeOld();
        const startChainId = await ethereumSw.getChainId();
        this.infuraProvider = InfuraProvider.getWebSocketProvider(+startChainId);
        this.browserProvider = new BrowserProvider(ethereumSw, +startChainId);
        await this.infuraProvider.on('pending', this.onPending);
        await this.infuraProvider.on('block', this.onBlock);

        this.preload();
        while (this.isConnected){
            // if chain is changed we should load again 4 blocks from new chain
            if (startChainId !== await ethereumSw.getChainId()){
                await this.stop();
                return this.start();
            }
            await this.removeOld();
            await this.checkSentTransfers();
            await Fn.asyncDelay(1000);
        }
    }

    private async checkSentTransfers(){
        await this.sentTransfers.isLoaded;
        for (let transfer of this.sentTransfers.toArray()) {
            if (transfer.state === "mined") continue;
            const provider = InfuraProvider.getWebSocketProvider(transfer.chainId);
            const tx = await provider.getTransaction(transfer._id);
            if (!tx) continue;
            if (tx.isMined()) {
                await this.sentTransfers.addOrUpdate({
                    ...transfer,
                    blockHash: tx.blockHash,
                    blockNumber: tx.blockNumber,
                    maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
                    state: 'mined'
                });
            } else {
                await this.sentTransfers.addOrUpdate({
                    ...transfer,
                    maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
                });
            }
        }
    }

    public async stop(){
        console.log('stop read transactions');
        this.isConnected = false;
        await this.infuraProvider.off('pending', this.onPending);
        await this.infuraProvider.off('block', this.onBlock);
        this.infuraProvider = null;
        this.browserProvider = null;
        await Fn.asyncDelay(2000);
    }

    private onBlock = (blockId: number) => {
        return this.readBlock(blockId, true);
    };
    private onPending = async txhash => {
        return this.pendingTransactions.addOrUpdate({
            _id: txhash,
            pendingTime: +new Date() / 1000
        } as any);
    };

    private async removeOld(){
        await this.storage.isLoaded;
        await this.pendingTransactions.isLoaded;
        for (let transaction of this.storage.toArray()) {
            if (transaction.pendingTime > +new Date()/1000 - TRANSACTION_WINDOW) continue;
            if (transaction.timestamp > +new Date()/1000 - TRANSACTION_WINDOW) continue;
            await this.storage.remove(transaction._id);
        }
        for (let transaction of this.pendingTransactions.toArray()) {
            if (transaction.pendingTime > +new Date()/1000 - TRANSACTION_WINDOW*10) continue;
            await this.storage.remove(transaction._id);
        }

    }

    private async readTransaction(transactionOrHash: string | TransactionResponse): Promise<TransactionResponse | null>{
        if (typeof transactionOrHash === "string"){
            if (this.storage.get(transactionOrHash)) return null;
            return this.browserProvider.getTransaction(transactionOrHash);
        }
        if (this.storage.get(transactionOrHash.hash)) return null;
        return transactionOrHash;
    }

    private async readBlock(number: number, withTransactions = false){
        const block = await this.browserProvider.getBlock(number, withTransactions);
        if (!block) return 0;
        for (let transactionOrHash of block.transactions) {
            if (!this.isConnected) return 0;
            const transaction = await this.readTransaction(transactionOrHash)
            if (!transaction?.maxPriorityFeePerGas) continue;
            const pending = this.pendingTransactions.get(transaction.hash);
            const data = {
                _id: transaction.hash,
                pendingTime: pending?.pendingTime,
                type: transaction.type,
                chainId: Number(await ethereumSw.getChainId()),
                maxPriorityFeePerGas: BigInt(transaction.maxPriorityFeePerGas),
                timestamp: +new Date()/1000,//Number(block.timestamp)
            } as TransactionInfo;
            await this.storage.addOrUpdate(data);
        }
        return block.transactions.length;
    }
    private async preload(){
        try {
            const blockNumber = await this.browserProvider.getBlockNumber();
            for (let i = 0, readTransactionsCount = 0; i < 128 && readTransactionsCount < 300; i++) {
                if (!this.isConnected) return;
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