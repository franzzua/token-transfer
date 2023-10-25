import {AsyncCell, Fn, Cell} from "@cmmn/cell/lib";
import {EtherscanApi} from "../services/etherscanApi";
import {Timer} from "../helpers/timer";
import {AccountStore} from "./account.store";
import {JsonRpcApiProvider, TransactionResponse} from "ethers";
import {ObservableDB} from "../helpers/observableDB";
import {GasOracle} from "../services/gas.oracle";

export class ChainStore{

    constructor(private api: EtherscanApi,
                private accountStore: AccountStore,
                private providerFactory: (chainId: number) => JsonRpcApiProvider) {

        Cell.OnChange(() => this.accountStore.chainId, this.init);
        this.init();
    }

    private init = async () => {
        await this.storage.init();
        this.estimator.removeAll();
        this.estimator.add(...this.storage.toArray().filter(this.transactionFilter));
        this.readTransactions().catch(console.error);
    }

    private get provider(){
        return this.providerFactory(this.accountStore.chainId);
    }

    private transactionFilter = (t: TransactionInfo) => t.timestamp < +new Date()/1000 - 60
        && t.chainId == this.accountStore.chainId
        && t.type == 2;

    private async clean(){
        this.estimator.removeAll(this.transactionFilter);
        for (let item of this.storage.toArray()) {
            if (!item.timestamp || this.transactionFilter(item)){
                await this.storage.remove(item._id);
            }
        }
    }

    private estimator = new GasOracle(
        {
            [0.2]: "slow",
            [0.5]: "average",
            [0.95]: "fast"
        } as const,
        "maxPriorityFeePerGas",
        [] as Array<TransactionInfo> );

    private timer = new Timer(3000);

    public get gasPrices(): GasInfo {
        return this.timer.get() && this.estimator.Percentiles as GasInfo;
    }
    //
    public gasTimes = new AsyncCell(async () => {
        if (this.accountStore.chainId !== 1)
            return {
                slow: 120,
                average: 45,
                fast: 30
            }
        const prices = this.gasPrices;
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
        const startChainId = this.accountStore.chainId;
        const blockNumber = await this.provider.getBlockNumber();
        if (this.accountStore.chainId !== startChainId) return;
        for (let i = 0; i < 6; i++) {
            const block = await this.provider.getBlock(blockNumber - i);
            if (this.accountStore.chainId !== startChainId) return;
            if (!block) continue;
            for (let hash of block.transactions) {
                if (this.storage.get(hash)) continue;
                const transaction = await block.getTransaction(hash);
                if (this.accountStore.chainId !== startChainId) return;
                const data = {
                    _id: hash,
                    type: transaction.type,
                    chainId: this.accountStore.chainId,
                    maxPriorityFeePerGas: transaction.maxPriorityFeePerGas,
                    timestamp: block.timestamp
                };
                await this.storage.addOrUpdate(data);
                if (data.type == 2)
                    this.estimator.add(data);
            }
        }
        await Fn.asyncDelay(5000);
        await this.clean();
        this.readTransactions().catch(console.error);
    }
}

type TransactionInfo = Pick<TransactionResponse, "maxPriorityFeePerGas"|"type"> & {
    timestamp: number;
    chainId: number;
};
export type GasInfo = null | {
    slow: bigint;
    average: bigint;
    fast: bigint;
};