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
    }

    private estimator = new GasOracle(
        [0.4, 0.6, 0.9999],
        "maxPriorityFeePerGas",
        [] as Array<TransactionInfo>, {
            "0.4": "slow",
            "0.6": "average",
            "0.9999": "fast"
        });

    private timer = new Timer(10000);

    public gasPrices = new AsyncCell(async () => {
        await this.storage.init();
        this.estimator.add(...this.storage.toArray().filter(x => x.type == 2));
        return this.timer.get() && this.estimator.Percentiles;
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

}

type TransactionInfo = Pick<TransactionResponse, "maxPriorityFeePerGas"|"hash"|"type">;