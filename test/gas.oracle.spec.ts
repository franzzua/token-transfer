import {test, beforeAll} from "@jest/globals";
import {GasOracle} from "../src/services/gas.oracle";
import {randomBytes, toBigInt} from "ethers";

test(`increase`,async () => {
    const gasOracle = new GasOracle([0.2,0.5,0.99], "maxPriorityFeePerGas");
    for (let i = 1n; i <= 100_000n; i++) {
        gasOracle.add({
            hash: '',
            maxPriorityFeePerGas: i,
            type: 2
        })
    }
    console.log(gasOracle.Percentiles);
});

test(`decrease`,async () => {
    const gasOracle = new GasOracle([0.2,0.5,0.99], "maxPriorityFeePerGas");
    for (let i = 1n; i <= 100_000n; i++) {
        gasOracle.add({
            hash: '',
            maxPriorityFeePerGas: 100_000n - i,
            type: 2
        })
    }
    gasOracle.removeAll(x => (x.maxPriorityFeePerGas % 2n) == 0n);
    console.log(gasOracle.Percentiles);
});
test(`increaseModule`,async () => {
    const gasOracle = new GasOracle([0.2,0.5,0.99], "value");
    for (let i = 1n; i <= 100_000n; i++) {
        gasOracle.add({
            value: i % 100n
        })
    }
    console.log(gasOracle.Percentiles);
});
test(`random`,async () => {
    const gasOracle = new GasOracle([0.2,0.5,0.99], "value");
    for (let i = 1n; i <= 100_000n; i++) {
        gasOracle.add({
            value: toBigInt(randomBytes(6)),
        })
    }
    console.log(gasOracle.Percentiles);
});
