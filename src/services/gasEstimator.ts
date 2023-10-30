import {EventEmitter} from "@cmmn/cell/lib";
import {Tree} from "./tree";

export class GasEstimator extends EventEmitter<{change: void}>{

    private percentiles = {
        slow: 0.1,
        average: 0.6,
        fast: 0.9,
    } as const;

    protected sort = (arr: GasEstimatorInfo[]) => arr.sort(
        (a,b) => a.maxPriorityFeePerGas > b.maxPriorityFeePerGas ? 1 : a.maxPriorityFeePerGas == b.maxPriorityFeePerGas ? 0 : -1
    );
    public add(...values: Array<GasEstimatorInfo>){
        if (values.length == 0)
            return;
        if (this.Size == 0) {
            this.init(values);
            return;
        }
        values.forEach(x => this.insert(x));
        this.emit("change");
    }

    public removeAll(filter?: (t: GasEstimatorInfo) => boolean, tree = this.tree){
        if (!filter) {
            this.tree = null;
            return;
        }
        this.tree = this.tree?.removeAll(filter);
        this.emit("change");
    }
    public get GasInfo(): GasInfo {
        if (this.Size < 100)
            return null;
        const gas = Object.fromEntries(Object.entries(this.percentiles).map(([key, perc]) =>
            [key, this.tree.get(Math.floor(perc*this.Size)).maxPriorityFeePerGas]
        )) as Record<keyof typeof this.percentiles, bigint>;
        const timeSums = Object.fromEntries(Object.entries(this.percentiles).map(([key, perc]) =>
            [key, []]
        )) as Record<keyof typeof this.percentiles, Array<number>>;
        for (let value of this.Values) {
            for (let key of Object.keys(this.percentiles)) {
                if (value.maxPriorityFeePerGas*10n > gas[key]*9n &&
                    value.maxPriorityFeePerGas*10n < gas[key]*11n){
                    timeSums[key].push(value.time)
                }
            }
        }
        return Object.fromEntries(
            Object.entries(this.percentiles).map(([name, percentile]) => {
                const timeSum = timeSums[name].sort();
                const time25 = timeSum[Math.floor(timeSum.length*0.25)];
                const time50 = timeSum[Math.floor(timeSum.length*0.5)];
                const time75 = timeSum[Math.floor(timeSum.length*0.75)];
                return [name, {
                    maxPriorityFeePerGas: gas[name],
                    time: timeSums[name].average(),
                    timePercs: [time25, time50, time75],
                    quality: timeSums[name].length
                }];
            })
        ) as any;
    }

    public get Values(): GasEstimatorInfo[]{
        const res = [];
        for (let item of this.tree.enumerate()) {
            res.push(item);
        }
        return res;
    }

    private tree: Tree<"maxPriorityFeePerGas", GasEstimatorInfo> = null;

    public get Size(){return this.tree?.size ?? 0; }

    protected init(values: Array<GasEstimatorInfo>){
        this.tree = new Tree(this.sort(values.slice()), "maxPriorityFeePerGas");
    }

    protected insert(transaction: GasEstimatorInfo){
        this.tree = this.tree.add(transaction);
    }
}


export type GasInfo = null | {
    slow: GasInfoPerc;
    average: GasInfoPerc;
    fast: GasInfoPerc;
};

export type GasInfoPerc = {maxPriorityFeePerGas: bigint, time: number, timePercs: [number, number, number], quality: number};


export type GasEstimatorInfo = {
    hash: string;
    maxPriorityFeePerGas: bigint;
    time: number;
}



