import {Cell, cell, Inject} from "@cmmn/cell/lib";
import {AccountService} from "../services/accountService";
import {ObservableDB} from "../helpers/observableDB";
import {GasEstimator, GasInfo} from "../services/gasEstimator";
import {chains} from "eth-chains/dist/src/chains.js";
import {Transaction} from "ethers";

export class ChainStore{

    constructor(@Inject(AccountService) private accountStore: AccountService) {

        Cell.OnChange(() => this.accountStore.chainId, this.init);
        this.storage.on('change', e => {
            switch (e?.type){
                case "addOrUpdate":
                    const newTransaction = e.value;
                    if (this.transactionFilter(newTransaction))
                        this.estimator.add({
                            hash: newTransaction._id,
                            maxPriorityFeePerGas: newTransaction.maxPriorityFeePerGas,
                            time: newTransaction.timestamp - newTransaction.pendingTime
                        });
                    break;
                case "delete":
                    this.estimator.removeAll(x => x.hash == e.key);
                    break;
            }
        })
        this.init();
    }

    @cell
    private estimator = new GasEstimator();

    @cell
    private storage = new ObservableDB<TransactionInfo>("transactions");

    private init = async () => {
        await this.storage.isLoaded;
        this.estimator.removeAll();
        this.estimator.add(...this.transactions);
    }

    private transactionFilter = (t: TransactionInfo) => t.timestamp
        && t.timestamp > +new Date()/1000 - 300
        && t.chainId == this.accountStore.chainId
        && t.type == 2;


    public get gasPrices(): GasInfo {
        return this.estimator.GasInfo;
    }
    @cell
    public get transactions(){
        return this.storage.toArray().filter(this.transactionFilter).map(x => ({
            hash: x._id,
            maxPriorityFeePerGas: x.maxPriorityFeePerGas,
            time: x.timestamp - x.pendingTime,
        }))
    }

    getChain(chainId) {
        return chains[chainId];
    }
}

type TransactionInfo = {
    type: number;
    maxPriorityFeePerGas: bigint;
    _id: string;
    timestamp: number;
    pendingTime?: number;
    chainId: number;
};