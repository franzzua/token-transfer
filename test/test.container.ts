import { Container } from "@cmmn/cell/lib";
import {BrowserProvider} from "ethers/providers";
import {Wallet} from "ethers/wallet";
import ganache from "ganache";
import {container, ProviderInjectionToken} from "../src/container";

export const etherium = globalThis.etherium = ganache.provider({
    logging: {quiet: true}
});
const accounts = etherium.getInitialAccounts();
const [from, to] = Object.keys(accounts);
const provider = new BrowserProvider(etherium);
const signer = new Wallet(accounts[from].secretKey, provider);
// @ts-ignore
provider.getSigner = () => signer;
export const testContainer = Container.withProviders(
    ...container.getProviders(),
    {provide: ProviderInjectionToken, useValue: provider}
)