import {Fn} from "@cmmn/cell/lib";
import type {Block, TransactionResponse} from "ethers";
import {ObservableDB} from "../helpers/observableDB";
import {etherium} from "./ethereum";
class TransactionReader {

    constructor() {
        etherium.connector.on('connected', () => this.start());
        etherium.connector.on('disconnected', () => this.stop());
    }

    private storage = new ObservableDB<TransactionInfo>("transactions");
    private isConnected = false;
    public async start(){
        console.log('start read transactions')
        this.isConnected = true;
        const startChainId = await etherium.getChainId();
        await this.preload();
        while (this.isConnected){
            // if chain is changed we should load again 4 blocks from new chain
            if (startChainId !== await etherium.getChainId()){
                return this.start();
            }
            await this.removeOld();
            try {
                const blockNumber = await etherium.request({
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
            if (transaction.timestamp > +new Date()/1000 - 300) continue;
            await this.storage.remove(transaction._id);
        }
    }

    private async readBlock(number: number){
        const block = await etherium.request<Block>({
            method: 'eth_getBlockByNumber',
            params: ['0x'+number.toString(16), false],
        });
        if (!block) return;
        for (let hash of block.transactions) {
            if (this.storage.get(hash)) continue;
            if (!this.isConnected) return;
            const transaction =  await etherium.request<TransactionResponse>({
                method: 'eth_getTransactionByHash',
                params: [hash],
            });
            if (!transaction.maxPriorityFeePerGas) continue;
            const data = {
                _id: hash,
                type: transaction.type,
                chainId: Number(await etherium.getChainId()),
                maxPriorityFeePerGas: BigInt(transaction.maxPriorityFeePerGas),
                timestamp: Number(block.timestamp)
            };
            await this.storage.addOrUpdate(data);
        }
    }
    private async preload(){
        try {
            const blockNumber = await etherium.request({
                method: 'eth_blockNumber'
            });
            for (let i = 0; i < 4; i++) {
                await this.readBlock(+blockNumber - i)
            }
        } catch (e){
            console.error(e);
        }
    }

}

export const transactionReader = new TransactionReader();

export type TransactionInfo = Pick<TransactionResponse, "maxPriorityFeePerGas"|"type"> & {
    _id: string;
    timestamp: number;
    chainId: number;
};