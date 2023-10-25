export class GasOracle<
    TKey extends string,
    TValue extends {
        [key in TKey]: bigint;
    },
    TNames extends Record<TPerc, string>,
    TPerc extends Exclude<number,0|1>,
> {
    constructor(private names: TNames,
                private key: TKey,
                values: Array<TValue> = []) {
        this.add(...values);
    }
    private percentiles: TPerc[] = Object.keys(this.names).map(x => +x as TPerc).sort();
    private linkedList: {
        min: LinkedListNode<TValue> | undefined;
    } = { min : undefined };

    private size: number = 0;
    private percPositions: Array<{perc: TPerc, node: LinkedListNode<TValue>, index: number}> = [];


    public add<TValue2 extends TValue>(...values: Array<TValue2>){
        if (values.length == 0)
            return;
        if (!this.linkedList.min) {
            values.sort((a,b) => a[this.key] > b[this.key] ? 1 :
                a[this.key] == b[this.key] ? 0 : -1);

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
            return;
        }
        values.forEach(x => this.insert(x));
        this.movePercentiles();
    }

    public removeAll(filter: (t: TValue) => boolean){
        if (!this.linkedList.min) return;
        for (let node = this.linkedList.min; node != null; node = node.next){
            if (!filter(node.data)) continue;
            const value = node.data[this.key];
            if (node.prev){
                node.prev.next = node.next;
            }
            if (node.next){
                node.next.prev = node.prev;
            }
            this.size--;
            for (let percPosition of this.percPositions) {
                if (percPosition.node.data[this.key] > value){
                    percPosition.index--;
                }
            }
        }
        this.movePercentiles();
    }

    private movePercentiles(){
        for (let item of this.percPositions) {
            const newIndex = Math.floor(item.perc * this.size);
            if (newIndex == item.index)
                continue;
            while (newIndex < item.index){
                item.node = item.node.prev;
                item.index--;
            }
            while (newIndex > item.index){
                item.node = item.node.next;
                item.index++;
            }
            if (!item.node){
                throw new Error(`moved out, ${newIndex} ${item.index}, ${item.perc}, ${this.size}`);
            }
        }
    }

    private insert(transaction: TValue){
        let start = this.linkedList.min;
        for (let percPosition of this.percPositions) {
            if (percPosition.node.data[this.key] > transaction[this.key]){
                percPosition.index++;
                continue;
            }
            start = percPosition.node;
        }

        for (let node = start; node !== undefined; node = node.next){
            if (transaction[this.key] < node.data[this.key]) {
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
        if (!this.linkedList.min)
            return null;
        return Object.fromEntries(
            this.percPositions.map(x =>
                [this.names[x.perc], x.node.data[this.key]]
            )
        ) as any;
    }

    public get Values(): number[]{
        const res = [];
        for (let node = this.linkedList.min; node != null; node = node.next){
            res.push(node.data[this.key]);
        }
        return res;
    }
}

type LinkedListNode<T> = {
    readonly data: Readonly<T>;
    next: LinkedListNode<T> | undefined;
    prev: LinkedListNode<T> | undefined;
}

