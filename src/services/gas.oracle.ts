export abstract class GasOracleBase<
    TKey extends string,
    TValue extends {
        [key in TKey]: bigint;
    },
    TNames extends Record<TPerc, string>,
    TPerc extends Exclude<number,0|1>,
> {
    constructor(protected names: TNames,
                protected key: TKey,
                values: Array<TValue> = []) {
        this.add(...values);
    }
    protected percentiles: TPerc[] = Object.keys(this.names).map(x => +x as TPerc).sort();
    protected sort = (arr: TValue[]) => arr.sort((a,b) => a[this.key] > b[this.key] ? 1 : a[this.key] == b[this.key] ? 0 : -1);
    public abstract get Size();

    public add<TValue2 extends TValue>(...values: Array<TValue2>){
        if (values.length == 0)
            return;
        if (this.Size == 0) {
            this.init(values);
            return;
        }
        values.forEach(x => this.insert(x));
        this.movePercentiles();
    }

    protected abstract init(values: Array<TValue>);

    public abstract removeAll(filter?: (t: TValue) => boolean);

    protected abstract movePercentiles();

    protected abstract insert(transaction: TValue);
    public abstract get Percentiles(): Record<TNames[keyof TNames], bigint>;

    public abstract get Values(): bigint[];
}

export class GasOracleLinkedList<
    TKey extends string,
    TValue extends {
        [key in TKey]: bigint;
    },
    TNames extends Record<TPerc, string>,
    TPerc extends Exclude<number,0|1>,
> extends GasOracleBase<TKey, TValue, TNames, TPerc>{

    private linkedList: {
        min: LinkedListNode<TValue> | undefined;
    } = { min : undefined };

    private size: number = 0;
    public get Size(){return this.size;}
    private percPositions: Array<{perc: TPerc, node: LinkedListNode<TValue>, index: number}> = [];

    protected init(values: Array<TValue>){
        values = this.sort(values.slice());

        this.linkedList.min = {data: values[0], next: undefined, prev: undefined};
        this.percPositions = this.percentiles.map(perc => ({
            perc,
            node: this.linkedList.min,
            index: Math.floor(perc*values.length),
        }));
        let lastNode = this.linkedList.min;
        let percIndex = 0;
        for (let i = 1; i < values.length; i++) {
            lastNode.next = {
                data: values[i], next: undefined, prev: lastNode
            };
            lastNode = lastNode.next;
            if (this.percPositions[percIndex]?.index === i){
                this.percPositions[percIndex].node = lastNode;
                percIndex++;
            }
        }
        this.size = values.length;
    }

    public removeAll(filter?: (t: TValue) => boolean){
        if (!this.linkedList.min) return;
        if (!filter){
            this.linkedList.min = null;
            this.percPositions = [];
            this.size = 0;
        }
        for (let node = this.linkedList.min, index = 0;
             node != null;
             node = node.next, index++){
            if (!filter(node.data)) continue;
            if (node.prev){
                node.prev.next = node.next;
            } else {
                this.linkedList.min = node.next;
            }
            if (node.next){
                node.next.prev = node.prev;
            }
            for (let percPosition of this.percPositions) {
                if (percPosition.index == index) {
                    percPosition.node = percPosition.node.prev;
                }
                if (percPosition.index >= index){
                    percPosition.index--;
                }
            }
            this.size--;
            index--;
        }
        this.movePercentiles();
    }

    protected movePercentiles(){
        for (let item of this.percPositions) {
            const newIndex = Math.floor(item.perc * this.size);
            while (newIndex < item.index){
                item.node = item.node.prev;
                item.index--;
            }
            while (newIndex > item.index){
                item.node = item.node.next;
                item.index++;
            }
        }
    }

    protected insert(transaction: TValue){
        const newValue = transaction[this.key];
        let start = this.linkedList.min;
        let index = 0;
        for (let percPosition of this.percPositions) {
            if (percPosition.node.data[this.key] >= newValue){
                percPosition.index++;
            } else {
                start = percPosition.node;
                index = percPosition.index;
            }
        }
        for (let node = start; ; node = node.next, index++){
            if (node.data[this.key] >= newValue) {
                node.prev = {
                    data: transaction, next: node, prev: node.prev
                };
                if (node.prev.prev) {
                    node.prev.prev.next = node.prev;
                } else{
                    this.linkedList.min = node.prev;
                }
                this.size++;
                return;
            }
            if (node.next == null){
                node.next = {
                    prev: node, next: undefined, data: transaction
                }
                this.size++;
                return;
            }
        }
    }
    public get Percentiles(): Record<TNames[keyof TNames], bigint> {
        if (this.size < 100)
            return null;
        return Object.fromEntries(
            this.percPositions.map(x =>
                [this.names[x.perc], x.node.data[this.key]]
            )
        ) as any;
    }

    public get Values(): bigint[]{
        const res = [] as Array<bigint>;
        for (let node = this.linkedList.min; node != null; node = node.next){
            res.push(node.data[this.key]);
        }
        return res;
    }
}


export class GasOracleArray<
    TKey extends string,
    TValue extends {
        [key in TKey]: bigint;
    },
    TNames extends Record<TPerc, string>,
    TPerc extends Exclude<number,0|1>,
> extends GasOracleBase<TKey, TValue, TNames, TPerc>{

    private array: TValue[] = [];

    public get Size(){return this.array.length;}

    protected init(values: Array<TValue>){
        this.array = this.sort(values.slice());

    }

    public removeAll(filter?: (t: TValue) => boolean){
        if (!filter){
            this.array.length = 0;
        } else {
            this.array = this.sort(arrayRemoveAll(this.array, filter));
        }
    }

    protected movePercentiles(){
    }

    protected insert(transaction: TValue){
        const value = transaction[this.key];
        let left = 0;
        let right = this.array.length - 1;
        while (left < right + 1){
            const leftValue = this.array[left][this.key];
            const rightValue = this.array[right][this.key];
            const avg = (leftValue + rightValue)/2n;
            if (value > avg)
                left = Math.floor((left + right)/2);
            else
                right = Math.floor((left + right)/2);
        }
        this.array.splice(left, 0, transaction)
    }
    public get Percentiles(): Record<TNames[keyof TNames], bigint> {
        if (this.Size < 100)
            return null;
        return Object.fromEntries(
            this.percentiles.map(x =>
                [this.names[x], this.array[Math.floor(x*this.Size)][this.key]]
            )
        ) as any;
    }

    public get Values(): bigint[]{
        return this.array.map(x => x[this.key]);
    }
}

type LinkedListNode<T> = {
    readonly data: Readonly<T>;
    next: LinkedListNode<T> | undefined;
    prev: LinkedListNode<T> | undefined;
}

function arrayRemoveAll<T>(arr: Array<T>, test: (x:T)=> boolean) {
    if (!test) {
        arr.length = 0;
        return arr;
    }
    let left = 0;
    let right = arr.length - 1;
    while (left <= right) {
        if (test(arr[left])) {
            const temp = arr[right];
            arr[right] = arr[left];
            arr[left] = temp;
            right--;
        }
        else {
            left++;
        }
    }
    arr.length = right + 1;
    return arr;
};

export class GasOracleTree<
    TKey extends string,
    TValue extends {
        [key in TKey]: bigint;
    },
    TNames extends Record<TPerc, string>,
    TPerc extends Exclude<number,0|1>,
> extends GasOracleBase<TKey, TValue, TNames, TPerc>{

    private tree: Tree<TKey, TValue> = null;

    public get Size(){return this.tree?.size ?? 0; }

    protected init(values: Array<TValue>){
        this.tree = new Tree<TKey, TValue>(this.sort(values.slice()), this.key);
    }

    public removeAll(filter?: (t: TValue) => boolean, tree = this.tree){
        if (!filter) {
            this.tree = null;
            return;
        }
        this.tree = this.tree?.removeAll(filter);
    }

    protected movePercentiles(){
    }

    protected insert(transaction: TValue){
        this.tree = this.tree.add(transaction);
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
}

class Tree<
    TKey extends string,
    TValue extends {
        [key in TKey]: bigint;
    }>{
    constructor(sorted: Array<TValue>, private key: TKey) {
        if (sorted.length == 1){
            this.data = sorted[0];
            this.size = 1;
            return;
        }
        const middle = Math.floor(sorted.length / 2);
        const left = sorted.slice(0, middle - 1);
        const right = sorted.slice(middle + 1);
        this.data = sorted[middle];
        this.left = left.length > 0 ? new Tree<TKey, TValue>(left, this.key) : null;
        this.right = right.length > 0 ? new Tree<TKey, TValue>(right, this.key) : null;
        this.size = sorted.length;
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



export const GasOracle = GasOracleTree;