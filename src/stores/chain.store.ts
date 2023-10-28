import {AsyncCell, Fn, Cell, cell} from "@cmmn/cell/lib";
import {EtherscanApi} from "../services/etherscanApi";
import {Timer} from "../helpers/timer";
import {AccountStore} from "./account.store";
import {JsonRpcApiProvider, TransactionResponse} from "ethers";
import {ObservableDB} from "../helpers/observableDB";
import {GasEstimator} from "../services/gas.oracle";
import {chains} from "eth-chains";
export class ChainStore{

    get chain(){
        return chains.get(this.accountStore.chainId);
    }

    public defaultToken = new Cell(() => this.chain.nativeCurrency.name);

    constructor(private api: EtherscanApi,
                private accountStore: AccountStore,
                private providerFactory: (chainId: number) => JsonRpcApiProvider) {

        Cell.OnChange(() => this.accountStore.chainId, this.init);
        this.storage.on('change', e => {
            switch (e?.type){
                case "addOrUpdate":
                    const newTransaction = e.value;
                    if (this.transactionFilter(newTransaction))
                        this.estimator.add(newTransaction);
                    break;
                case "delete":
                    this.estimator.removeAll(x => x._id == e.key);
                    break;
            }
        })
        this.init();
    }

    @cell
    private estimator = new GasEstimator(
        {
            [0.02]: "slow",
            [0.5]: "average",
            [0.99]: "fast"
        } as const,
        "maxPriorityFeePerGas",
        [] as Array<TransactionInfo> );

    private storage = new ObservableDB<TransactionInfo>("transactions");

    private init = async () => {
        await this.storage.init();
        this.estimator.removeAll();
        const stored = this.storage.toArray().filter(this.transactionFilter);
        console.log(stored.length)
        this.estimator.add(...stored);
    }

    private transactionFilter = (t: TransactionInfo) => t.timestamp > +new Date()/1000 - 300
        && t.chainId == this.accountStore.chainId
        && t.type == 2;

    private timer = new Timer(3000);

    public get gasPrices(): GasInfo {
        return this.estimator.Percentiles as GasInfo;
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

}

type TransactionInfo = Pick<TransactionResponse, "maxPriorityFeePerGas"|"type"> & {
    _id: string;
    timestamp: number;
    chainId: number;
};
export type GasInfo = null | {
    slow: bigint;
    average: bigint;
    fast: bigint;
};