import {test, beforeAll} from "@jest/globals";
import {GasEstimator} from "../src/services/gasEstimator";
import {randomBytes, toBigInt} from "ethers";

const percentileNames = {
    [0.2]: "slow",
    [0.5]: "average",
    [0.6]: "fast"
} as const;
test(`init`,async () => {
    const gasOracle = new GasEstimator(percentileNames, "value");
    const buffer = []
    for (let i = 1n; i <= 100_000n; i++) {
        buffer.push({
            value: i,
        });
    }
    gasOracle.add(...buffer);
    const values = gasOracle.Values;
    expect(values).toHaveLength(100_000);
    for (let i = 0; i < values.length; i++) {
        expect(Number(values[i])).toEqual((i + 1));
    }
    const percentiles = gasOracle.GasInfo;
    expect(Math.abs(Number(percentiles.slow - 20000n))).toBeLessThan(3);
    expect(Math.abs(Number(percentiles.average - 50000n))).toBeLessThan(3);
    expect(Math.abs(Number(percentiles.fast - 60000n))).toBeLessThan(3);
});

test(`increase`,async () => {
    const gasOracle = new GasEstimator(percentileNames, "maxPriorityFeePerGas");
    for (let i = 1n; i <= 100_000n; i++) {
        gasOracle.add({
            hash: '',
            maxPriorityFeePerGas: i,
            type: 2
        });
    }
    const percentiles = gasOracle.GasInfo;
    expect(Math.abs(Number(percentiles.slow - 20000n))).toBeLessThan(3);
    expect(Math.abs(Number(percentiles.average - 50000n))).toBeLessThan(3);
    expect(Math.abs(Number(percentiles.fast - 60000n))).toBeLessThan(3);
});

test(`decrease`,async () => {
    const gasOracle = new GasEstimator(percentileNames, "maxPriorityFeePerGas");
    for (let i = 1n; i <= 100_000n; i++) {
        gasOracle.add({
            hash: '',
            maxPriorityFeePerGas: 100_000n - i,
            type: 2
        })
    }
    gasOracle.removeAll(x => (x.maxPriorityFeePerGas % 2n) == 0n);
    const percentiles = gasOracle.GasInfo;
    expect(Math.abs(Number(percentiles.slow - 20000n))).toBeLessThan(3);
    expect(Math.abs(Number(percentiles.average - 50000n))).toBeLessThan(3);
    expect(Math.abs(Number(percentiles.fast - 60000n))).toBeLessThan(3);
});
test(`increaseModule`,async () => {
    const gasOracle = new GasEstimator(percentileNames, "value");
    for (let i = 1n; i <= 100_000n; i++) {
        gasOracle.add({
            value: i % 100n
        })
    }
    // gasOracle.removeAll(x => (x.value % 2n) == 0n);
    gasOracle.removeAll(x => (x.value % 2n) == 0n);
    const percentiles = gasOracle.GasInfo;
    expect(Math.abs(Number(percentiles.slow - 20n))).toBeLessThan(3);
    expect(Math.abs(Number(percentiles.average - 50n))).toBeLessThan(3);
    expect(Math.abs(Number(percentiles.fast - 60n))).toBeLessThan(3);
});
test(`equal`,async () => {
    const gasOracle = new GasEstimator(percentileNames, "value");
    for (let i = 1n; i <= 100_000n; i++) {
        gasOracle.add({
            value: 100n
        })
    }
    const percentiles = gasOracle.GasInfo;
    expect(Math.abs(Number(percentiles.slow - 100n))).toBeLessThan(3);
    expect(Math.abs(Number(percentiles.average - 100n))).toBeLessThan(3);
    expect(Math.abs(Number(percentiles.fast - 100n))).toBeLessThan(3);
});
test(`random`,async () => {
    const gasOracle = new GasEstimator(percentileNames, "value");
    for (let i = 1n; i <= 100_000n; i++) {
        gasOracle.add({
            value: toBigInt(randomBytes(6)),
        })
    }
    gasOracle.removeAll(x => (x.value % 2n) == 0n);
    console.log(gasOracle.GasInfo);
});
