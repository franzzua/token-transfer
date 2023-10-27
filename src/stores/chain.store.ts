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
        this.storage.on('change', e => {
            switch (e?.type){
                case "addOrUpdate":
                    const newTransaction = e.value;
                    if (this.transactionFilter(newTransaction))
                        this.oracle.add(newTransaction);
                    break;
                case "delete":
                    this.oracle.removeAll(x => x._id == e.key);
                    break;
            }
        })
        this.init();
    }

    private storage = new ObservableDB<TransactionInfo>("transactions");

    private init = async () => {
        await this.storage.init();
        this.oracle.removeAll();
        this.oracle.add(...this.storage.toArray().filter(this.transactionFilter));
    }

    private transactionFilter = (t: TransactionInfo) => t.timestamp > +new Date()/1000 - 300
        && t.chainId == this.accountStore.chainId
        && t.type == 2;

    private async clean(){
        this.oracle.removeAll(t => !this.transactionFilter(t));
        for (let item of this.storage.toArray()) {
            if (!item.timestamp || !this.transactionFilter(item)){
                await this.storage.remove(item._id);
            }
        }
    }

    private oracle = new GasOracle(
        {
            [0.2]: "slow",
            [0.5]: "average",
            [0.90]: "fast"
        } as const,
        "maxPriorityFeePerGas",
        [] as Array<TransactionInfo> );

    private timer = new Timer(3000);

    public get gasPrices(): GasInfo {
        return this.timer.get() && this.oracle.Percentiles as GasInfo;
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