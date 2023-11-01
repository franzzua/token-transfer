import { Container } from "@cmmn/cell/lib";
import {BrowserProvider} from "ethers/providers";
import {Wallet} from "ethers/wallet";
import ganache from "ganache";
import {container, ProviderInjectionToken} from "../container";

// @ts-ignore
globalThis.localStorage = {
    storage: {} as Record<string, any>,
    getItem(key: string): string | null {
        return this.storage[key];
    },
    setItem(key: string, value: any) {
        this.storage[key] = value;
    }
}
export const ethereum = ganache.provider({
    logging: {quiet: true}
});
globalThis.ethereum = ethereum;
globalThis.ethereum.addListener = () => {}
const accounts = ethereum.getInitialAccounts();
const [from, to] = Object.keys(accounts);
const provider = new BrowserProvider(ethereum);
const signer = new Wallet(accounts[from].secretKey, provider);
// @ts-ignore
provider.getSigner = () => signer;
export const testContainer = Container.withProviders(
    ...container.getProviders(),
    {provide: ProviderInjectionToken, useValue: () => provider}
)