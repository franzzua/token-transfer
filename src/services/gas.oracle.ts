import {EventEmitter} from "@cmmn/cell/lib";

export class GasEstimator<
    TKey extends string,
    TValue extends {
        [key in TKey]: bigint;
    },
    TNames extends Record<TPerc, string>,
    TPerc extends Exclude<number,0|1>,
> extends EventEmitter<{change: void}>{

    constructor(protected names: TNames,
                protected key: TKey,
                values: Array<TValue> = []) {
        super();
        this.init(values);
    }
    protected percentiles: TPerc[] = Object.keys(this.names).map(x => +x as TPerc).sort();
    protected sort = (arr: TValue[]) => arr.sort((a,b) => a[this.key] > b[this.key] ? 1 : a[this.key] == b[this.key] ? 0 : -1);


    public add<TValue2 extends TValue>(...values: Array<TValue2>){
        if (values.length == 0)
            return;
        if (this.Size == 0) {
            this.init(values);
            return;
        }
        values.forEach(x => this.insert(x));
        this.emit("change");
    }

    public removeAll(filter?: (t: TValue) => boolean, tree = this.tree){
        if (!filter) {
            this.tree = null;
            return;
        }
        this.tree = this.tree?.removeAll(filter);
        this.emit("change");
    }
    public get Percentiles(): Record<TNames[keyof TNames], bigint> {
        if (this.Size < 100)
            return null;
        return Object.fromEntries(
            this.percentiles.map(x =>
                [this.names[x], this.tree.get(Math.floor(x*this.Size))?.[this.key]]
            )
        ) as any;
    }

    public get Values(): bigint[]{
        const res = [];
        for (let item of this.tree.enumerate()) {
            res.push(item[this.key]);
        }
        return res;
    }

    private tree: Tree<TKey, TValue> = null;

    public get Size(){return this.tree?.size ?? 0; }

    protected init(values: Array<TValue>){
        this.tree = new Tree<TKey, TValue>(this.sort(values.slice()), this.key);
    }

    protected insert(transaction: TValue){
        this.tree = this.tree.add(transaction);
    }
}

class Tree<
    TKey extends string,
    TValue extends {
        [key in TKey]: bigint;
    }>{
    constructor(sorted: Array<TValue>, private key: TKey, from = 0, to = sorted.length) {
        if (sorted.length == 1){
            this.data = sorted[0];
            this.size = 1;
            return;
        }
        const middle = Math.floor((to + from) / 2);
        this.data = sorted[middle];
        this.left = middle > from ? new Tree<TKey, TValue>(sorted, this.key, from, middle) : null;
        this.right = to > middle + 1 ? new Tree<TKey, TValue>(sorted, this.key, middle + 1, to) : null;
        this.size = to - from;
    }

    public readonly data: TValue;
    private left: Tree<TKey, TValue>;
    private right: Tree<TKey, TValue>;
    public size: number;


    public get(index: number): TValue{
        return this.getNode(index)?.data;
    }
    private getNode(index: number): Tree<TKey, TValue>{
        if (index > this.size) return null;
        if (index == this.leftSize) return this;
        if (index < this.leftSize) return this.left.getNode(index);
        return this.right?.getNode(index - this.leftSize - 1);
    }

    public removeAll(filter: (t: TValue) => boolean): Tree<TKey, TValue>{
        this.left = this.left?.removeAll(filter);
        this.right = this.right?.removeAll(filter);
        this.size = this.leftSize + this.rightSize + 1;
        if (!filter(this.data)){
            return this.rebuild();
        }
        return this.left?.merge(this.right) ?? this.right;
    }

    private merge(right: Tree<TKey, TValue>): Tree<TKey, TValue>{
        if (!right) return this;
        if(this.size > right.size) {
            this.right = this.right?.merge(right) ?? right;
            this.size = this.leftSize + this.rightSize + 1;
            return this.rebuild();
        }else{
            right.left = this.merge(right.left);
            right.size = right.leftSize + right.rightSize + 1;
            return right.rebuild();
        }
    }

    public add(value: TValue): Tree<TKey, TValue>{
        if (value[this.key] >= this.data[this.key]){
            this.right = this.right?.add(value) ?? new Tree<TKey, TValue>([value], this.key);
        } else {
            this.left = this.left?.add(value) ?? new Tree<TKey, TValue>([value], this.key);
        }
        this.size++;
        return this.rebuild();
    }

    public *enumerate(): Generator<TValue>{
        if (this.left){
            for (let value of this.left.enumerate()) {
                yield value;
            }
        }
        yield this.data;
        if (this.right){
            for (let value of this.right.enumerate()) {
                yield value;
            }
        }
    }

    private rebuild(){
        if (Math.abs(this.leftSize - this.rightSize) < Math.max(this.size / 10, 4))
            return this;
        if (this.rightSize > this.leftSize){
            const newRoot = this.right;
            this.right = newRoot.left;
            this.size = this.leftSize+this.rightSize+1;
            newRoot.left = this;
            newRoot.size = newRoot.leftSize+newRoot.rightSize+1;
            return newRoot;
        } else {
            const newRoot = this.left;
            this.left = newRoot.right;
            this.size = this.leftSize+this.rightSize+1;
            newRoot.right = this;
            newRoot.size = newRoot.leftSize+newRoot.rightSize+1;
            return newRoot;
        }
    }

    public check(){
        if (this.size !== ((this.left?.size??0) + (this.right?.size??0) + 1))
            console.log(this.data[this.key], this.size, this.leftSize, this.rightSize)
    }

    private get leftSize(){
        return this.left?.size ?? 0;
    }

    private get rightSize(){
        return this.right?.size ?? 0;
    }
}



