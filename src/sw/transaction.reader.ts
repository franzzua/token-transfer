import {Fn} from "@cmmn/cell/lib";
import type {Block, TransactionResponse} from "ethers";
import {ObservableDB} from "../helpers/observableDB";
import {etherium} from "./ethereum";
export class TransactionReader {

    constructor() {
        this.readTransactions()
    }

    private storage = new ObservableDB("transactions");

    private async readTransactions(){
        try {
            const blockNumber = await etherium.request({
                method: 'eth_blockNumber'
            });
            for (let i = 0; i < 100; i++) {
                const block = await etherium.request<Block>({
                    method: 'eth_getBlockByNumber',
                    params: ['0x'+(+blockNumber-i).toString(16), false],
                });
                if (!block) continue;
                for (let hash of block.transactions) {
                    if (this.storage.get(hash)) continue;
                    const transaction =  await etherium.request<TransactionResponse>({
                        method: 'eth_getTransactionByHash',
                        params: [hash],
                    });
                    const data = {
                        _id: hash,
                        type: transaction.type,
                        chainId: Number(await etherium.getChainId()),
                        maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
                        timestamp: block.timestamp
                    };
                    await this.storage.addOrUpdate(data);
                }
            }
        } catch (e){
            console.error(e);
        }
        await Fn.asyncDelay(1000);
        this.readTransactions().catch(console.error);
    }

}