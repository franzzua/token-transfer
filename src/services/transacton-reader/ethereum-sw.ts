import type {BaseProvider} from '@metamask/providers';
import {OnlyOneClientConnector} from "./only-one-client-connector";


class EthereumSw implements Pick<BaseProvider, "request">{
    public connector = new OnlyOneClientConnector("ethereum");
    private async requestBase<TResult>(action: string, data?: any): Promise<TResult> {
        if (globalThis.ethereum) {
            return (typeof globalThis.ethereum[action] === "function")
                ? globalThis.ethereum[action](data)
                : globalThis.ethereum[action];
        }
        const id = getId();
        this.connector.postMessage([id, action, data]);
        const {result, error} = await this.connector.onceAsync(id);
        if (error) throw error;
        return result;
    }
    request<TResult, T = any>(data: T): Promise<TResult>{
        return this.requestBase<TResult>('request', data);
    }
    getChainId(): Promise<string>{
        return this.requestBase<string>('chainId');
    }
}

const getId = () => Array.from(crypto.getRandomValues(new Uint32Array(2))).map(x => x.toString(16)).join('');

export const ethereumSw = new EthereumSw();
