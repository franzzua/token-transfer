import {test, beforeAll} from "@jest/globals";
import {ContractFactory} from "ethers/contract";
import type {JsonRpcProvider} from "ethers/providers";
import {Wallet} from "ethers/wallet";
import {ProviderInjectionToken, TransferApi} from "../src/lib";
import {etherium, testContainer} from "./test.container";
import {abi, bytecode} from "erc20-compiled";


const api = testContainer.get<TransferApi>(TransferApi);
const provider = testContainer.get<JsonRpcProvider>(ProviderInjectionToken);
const accounts = etherium.getInitialAccounts();
const [from, to] = Object.keys(accounts);
let tokenAddress: string = '';
beforeAll(async () => {
    const signer = new Wallet(accounts[from].secretKey, provider);
    const factory = new ContractFactory(abi, bytecode, signer);
    const deploy = await factory.deploy("TEST", "TST", 10*(10**6));
    tokenAddress = await deploy.getAddress();
})
test(`run transaction`,async () => {
    const res = await api.run(tokenAddress, to, 1n*(10n**6n), 0n)
});
