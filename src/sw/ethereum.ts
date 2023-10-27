declare var self: ServiceWorkerGlobalScope;
import {EventEmitter} from "@cmmn/cell/lib";
import type {BaseProvider} from '@metamask/providers';

class Connector extends EventEmitter<Record<string, any>>{

    public port: MessagePort | null = null;
    constructor(private namespace: string) {
        super();
        self.addEventListener('message', async event => {
            switch (event.data?.action){
                case "connect":
                    if (!this.port)
                        this.connect(event.source as MessagePort);
                    break;
                case "disconnect":
                    if (this.port === event.source) {
                        this.disconnect();
                        const port = event.ports.find(x => x != this.port);
                        port && this.connect(port);
                    }
                    break;
            }
            if (event.data?.namespace == this.namespace){
                if (!Array.isArray(event.data?.data)) return;
                const [id, result, error] = event.data.data;
                super.emit(id, {result, error});
            }
        })
    }
    public disconnect(){
        this.port = null;
    }

    public connect(port: MessagePort){
        this.port = port;
    }

    public postMessage(data: any){
        if (!this.port) throw new Error(`disconnected`);
        this.port.postMessage({
            namespace: this.namespace,
            data: data
        });
    }

}
class Ethereum implements Pick<BaseProvider, "request">{
    private connector = new Connector("ethereum");
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

export const etherium = new Ethereum();