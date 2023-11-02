import {test, beforeAll} from "@jest/globals";
import {ContractFactory} from "ethers/contract";
import type {JsonRpcProvider} from "ethers/providers";
import {Wallet} from "ethers/wallet";
import {ProviderInjectionToken, TransferApi} from "../lib";
import {AccountService} from "../services/accountService";
import {ethereum, testContainer} from "./test.container";
import {abi, bytecode} from "erc20-compiled";


const api = testContainer.get<TransferApi>(TransferApi);
const provider = testContainer.get<() => JsonRpcProvider>(ProviderInjectionToken)();
const accounts = ethereum.getInitialAccounts();
const [from, to] = Object.keys(accounts);
let tokenAddress: string = '';
beforeAll(async () => {
    const signer = new Wallet(accounts[from].secretKey, provider);
    const factory = new ContractFactory(abi, bytecode, signer);
    const deploy = await factory.deploy("TEST", "TST", 10*(10**6));
    tokenAddress = await deploy.getAddress();
    testContainer.get<AccountService>(AccountService).me = from;
})
test(`run transaction`,async () => {
    const amount = 1n*(10n**6n);
    const bFromBefore = await api.getBalance(tokenAddress);
    const res = await api.run(tokenAddress, to, amount, 0n)
    expect(res._id).not.toBeNull();
    expect(res.state).toBe('pending')
    const tr = await provider.getTransaction(res._id);
    expect(tr.isMined()).toBeTruthy();
    const bFrom = await api.getBalance(tokenAddress);
    expect(bFromBefore - bFrom).toEqual(amount);
});
test(`fail transaction`,async () => {
    const amount = 20n*(10n**6n);
    const balanceBefore = await api.getBalance(tokenAddress);
    const res = await api.run(tokenAddress, to, amount, 0n).catch(e => "error");
    expect(res).toBe("error")
    const balance = await api.getBalance(tokenAddress);
    expect(balanceBefore).toEqual(balance);
});
test(`get gas`,async () => {
    const gas = await api.estimateGas(tokenAddress, to, 1n*(10n**6n), from)
    expect(gas).toBeGreaterThan(0n);
});
