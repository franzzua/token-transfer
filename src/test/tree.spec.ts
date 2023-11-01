import {test, beforeAll} from "@jest/globals";
import * as crypto from "crypto";
import { toBigInt} from "ethers/utils";
import {Tree} from "../services/tree";

const percentileNames = {
    [0.2]: "slow",
    [0.5]: "average",
    [0.6]: "fast"
} as const;
test(`init`,async () => {
    const buffer = []
    for (let i = 1n; i <= 100_000n; i++) {
        buffer.push({
            value: i,
        });
    }
    const tree = new Tree(buffer, "value");
    const values = Array.from(tree.enumerate())
    expect(values).toHaveLength(100_000);
    for (let i = 0; i < values.length; i++) {
        expect(Number(values[i].value)).toEqual((i + 1));
    }
});

test(`increase`,async () => {
    let tree = new Tree([{value: 0n}], "value");
    for (let i = 1n; i <= 100_000n; i++) {
        tree = tree.add({
            hash: '',
            value: i,
            type: 2
        });
    }
    const percentiles = Object.fromEntries(Object.entries(percentileNames).map(([perc,value]) =>
        [value, tree.get(Math.floor(tree.size*+perc))]
    ));
    expect(Math.abs(Number(percentiles.slow.value - 20000n))).toBeLessThan(3);
    expect(Math.abs(Number(percentiles.average.value - 50000n))).toBeLessThan(3);
    expect(Math.abs(Number(percentiles.fast.value - 60000n))).toBeLessThan(3);
});

test(`decrease`,async () => {
    let tree = new Tree([{value: 0n}], "value");
    for (let i = 1n; i <= 100_000n; i++) {
        tree = tree.add({
            hash: '',
            value: 100_000n - i,
            type: 2
        })
    }
    tree = tree.removeAll(x => (x.value % 2n) == 0n);
    const percentiles = Object.fromEntries(Object.entries(percentileNames).map(([perc,value]) =>
        [value, tree.get(Math.floor(tree.size*+perc))]
    ))
    expect(Math.abs(Number(percentiles.slow.value - 20000n))).toBeLessThan(3);
    expect(Math.abs(Number(percentiles.average.value - 50000n))).toBeLessThan(3);
    expect(Math.abs(Number(percentiles.fast.value - 60000n))).toBeLessThan(3);
});
test(`increaseModule`,async () => {
    let tree = new Tree([{value: 0n}], "value");
    for (let i = 1n; i <= 100_000n; i++) {
        tree = tree.add({
            value: i % 100n
        })
    }
    // tree.removeAll(x => (x.value % 2n) == 0n);
    tree = tree.removeAll(x => (x.value % 2n) == 0n);
    const percentiles = Object.fromEntries(Object.entries(percentileNames).map(([perc,value]) =>
        [value, tree.get(Math.floor(tree.size*+perc))]
    ))
    expect(Math.abs(Number(percentiles.slow.value - 20n))).toBeLessThan(3);
    expect(Math.abs(Number(percentiles.average.value - 50n))).toBeLessThan(3);
    expect(Math.abs(Number(percentiles.fast.value - 60n))).toBeLessThan(3);
});
test(`equal`,async () => {
    let tree = new Tree([{value: 0n}], "value");
    for (let i = 1n; i <= 100_000n; i++) {
        tree = tree.add({
            value: 100n
        })
    }
    const percentiles = Object.fromEntries(Object.entries(percentileNames).map(([perc,value]) =>
        [value, tree.get(Math.floor(tree.size*+perc))]
    ))
    expect(Math.abs(Number(percentiles.slow.value - 100n))).toBeLessThan(3);
    expect(Math.abs(Number(percentiles.average.value - 100n))).toBeLessThan(3);
    expect(Math.abs(Number(percentiles.fast.value - 100n))).toBeLessThan(3);
});
test(`random`,async () => {
    let tree = new Tree([{value: 0n}], "value");
    for (let i = 1n; i <= 100_000n; i++) {
        tree = tree.add({
            value: toBigInt(crypto.getRandomValues(new Uint8Array(6))),
        })
    }
    tree = tree.removeAll(x => (x.value % 2n) == 0n);
});
