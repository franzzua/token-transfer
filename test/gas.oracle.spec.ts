import {test, beforeAll} from "@jest/globals";
import {GasOracle} from "../src/services/gas.oracle";
import {randomBytes, toBigInt} from "ethers";

const percentileNames = {
    [0.2]: "slow",
    [0.5]: "average",
    [0.6]: "fast"
} as const;
test(`increase`,async () => {
    const gasOracle = new GasOracle(percentileNames, "maxPriorityFeePerGas");
    for (let i = 1n; i <= 100_000n; i++) {
        gasOracle.add({
            hash: '',
            maxPriorityFeePerGas: i,
            type: 2
        });
    }
    const percentiles = gasOracle.Percentiles;
    expect(Math.abs(Number(percentiles.slow - 20000n))).toBeLessThan(3);
    expect(Math.abs(Number(percentiles.average - 50000n))).toBeLessThan(3);
    expect(Math.abs(Number(percentiles.fast - 60000n))).toBeLessThan(3);
});

test(`decrease`,async () => {
    const gasOracle = new GasOracle(percentileNames, "maxPriorityFeePerGas");
    for (let i = 1n; i <= 100_000n; i++) {
        gasOracle.add({
            hash: '',
            maxPriorityFeePerGas: 100_000n - i,
            type: 2
        })
    }
    gasOracle.removeAll(x => (x.maxPriorityFeePerGas % 2n) == 0n);
    const percentiles = gasOracle.Percentiles;
    expect(Math.abs(Number(percentiles.slow - 20000n))).toBeLessThan(3);
    expect(Math.abs(Number(percentiles.average - 50000n))).toBeLessThan(3);
    expect(Math.abs(Number(percentiles.fast - 60000n))).toBeLessThan(3);
});
test(`increaseModule`,async () => {
    const gasOracle = new GasOracle(percentileNames, "value");
    for (let i = 1n; i <= 100_000n; i++) {
        gasOracle.add({
            value: i % 100n
        })
    }
    // gasOracle.removeAll(x => (x.value % 2n) == 0n);
    gasOracle.removeAll(x => (x.value % 2n) == 0n);
    const percentiles = gasOracle.Percentiles;
    expect(Math.abs(Number(percentiles.slow - 20n))).toBeLessThan(3);
    expect(Math.abs(Number(percentiles.average - 50n))).toBeLessThan(3);
    expect(Math.abs(Number(percentiles.fast - 60n))).toBeLessThan(3);
});
test(`equal`,async () => {
    const gasOracle = new GasOracle(percentileNames, "value");
    for (let i = 1n; i <= 100_000n; i++) {
        gasOracle.add({
            value: 100n
        })
    }
    const percentiles = gasOracle.Percentiles;
    expect(Math.abs(Number(percentiles.slow - 100n))).toBeLessThan(3);
    expect(Math.abs(Number(percentiles.average - 100n))).toBeLessThan(3);
    expect(Math.abs(Number(percentiles.fast - 100n))).toBeLessThan(3);
});
test(`random`,async () => {
    const gasOracle = new GasOracle(percentileNames, "value");
    for (let i = 1n; i <= 100_000n; i++) {
        gasOracle.add({
            value: toBigInt(randomBytes(6)),
        })
    }
    gasOracle.removeAll(x => (x.value % 2n) == 0n);
    console.log(gasOracle.Percentiles);
});
