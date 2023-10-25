import {AsyncCell} from "@cmmn/cell/lib";
import {EtherscanApi} from "../services/etherscanApi";
import {Timer} from "../helpers/timer";
import {AccountStore} from "./account.store";
import {Block, JsonRpcApiProvider, Transaction, TransactionResponse} from "ethers";
import {ObservableDB} from "../helpers/observableDB";
import {GasOracle} from "../services/gas.oracle";

export class ChainStore{

    constructor(private api: EtherscanApi,
                private accountStore: AccountStore,
                private provider: JsonRpcApiProvider) {
        this.storage.init().then(() => {
            for (let item of this.storage.toArray()) {
                if (!item.timestamp || this.transactionFilter(item)){
                    this.storage.remove(item._id);
                }
            }
            this.estimator.add(...this.storage.toArray().filter(x => x.type == 2));
        });
        this.readTransactions();
    }

    private transactionFilter = (t: TransactionInfo) => t.timestamp < +new Date()/1000 - 60

    private estimator = new GasOracle(
        {
            "0.2": "slow",
            "0.5": "average",
            "0.95": "fast"
        },
        "maxPriorityFeePerGas",
        [] as Array<TransactionInfo> );

    private timer = new Timer(3000);

    public gasPrices = new AsyncCell(async () => {
        this.timer.get();
        await this.storage.init();
        this.estimator.removeAll(this.transactionFilter);
        return this.estimator.Percentiles;
    });
    //
    public gasTimes = new AsyncCell(async () => {
        if (this.accountStore.chainId !== 1)
            return {
                slow: 120,
                average: 45,
                fast: 30
            }
        const prices = this.gasPrices.get();
        if (!prices) return null;
        return {
            slow: await this.api.getEstimationTime(prices.slow),
            average: await this.api.getEstimationTime(prices.average),
            fast: await this.api.getEstimationTime(prices.fast),
        }
    });

    private storage = new ObservableDB<TransactionInfo & {
        _id: string;
    }>("transactions");

    private async readTransactions(){
        const blockNumber = await this.provider.getBlockNumber();
        for (let i = 0; i < 4; i--) {
            const block = await this.provider.getBlock(blockNumber - i);
            console.log(block);
            if (!block) continue;
            for (let hash of block.transactions) {
                if (this.storage.get(hash)) continue;
                const transaction = await block.getTransaction(hash);
                const data = {
                    _id: hash,
                    type: transaction.type,
                    maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
                    timestamp: block.timestamp
                };
                await this.storage.addOrUpdate(data);
                if (data.type == 2)
                    this.estimator.add(data);
            }
        }
    }
}

type TransactionInfo = Pick<TransactionResponse, "maxPriorityFeePerGas"|"type"> & {
    timestamp: number;
};