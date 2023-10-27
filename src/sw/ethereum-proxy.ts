export class EthereumProxy{
    private ethereum = window.ethereum;
    private channel = navigator.serviceWorker;
    // only one tab should be connected
    private isConnected = false;
    private namespace = "ethereum";
    constructor() {
        this.channel.addEventListener('message', async e => {
            if (e.data.namespace !== this.namespace) return;
            if (!Array.isArray(e.data.data)) return;
            const [id, action, data] = e.data.data;
            if ('action' in this.ethereum) return;
            try {
                const result = (typeof this.ethereum[action] !== "function")
                    ? this.ethereum[action]
                    : await this.ethereum[action](data);
                this.channel.controller.postMessage({
                    namespace: this.namespace,
                    data: [id, result]
                });
            }catch (e){
                this.channel.controller.postMessage({
                    namespace: this.namespace,
                    data: [id, undefined, e.message]
                });
            }
        })
    }
}
