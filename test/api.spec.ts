import {test, beforeAll} from "@jest/globals";
import {ContractFactory, JsonRpcProvider, parseEther, Provider, Wallet, parseUnits} from "ethers";
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
    const res = api.run({
        from, to, _id: '1',
        id: null,
        amount: 1n*(10n**6n),
        tokenAddress,
        state: 'initial'
    });
    const states = ['pending', 'signed', 'mined'];
    for await (let {state} of res){
        expect(state).toEqual(states.shift());
    }
    expect(states).toHaveLength(0);
});
