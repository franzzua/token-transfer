import {EventEmitter} from "@cmmn/cell/lib";
declare var self: ServiceWorkerGlobalScope;

export class OnlyOneClientConnector extends EventEmitter<Record<string, any> & {
    connected: void;
    disconnected: void;
}> {

    public client: Client | null = null;

    constructor(private namespace: string) {
        super();
        this.subscribeResponses();
    }

    private subscribeResponses() {
        self.addEventListener('message', async event => {
            if (event.data?.namespace == this.namespace) {
                if (!Array.isArray(event.data?.data)) return;
                const [id, result, error] = event.data.data;
                super.emit(id, {result, error});
            }
        });
    }

    private connectedPorts = new Map<string, Client>();

    public disconnect(client: Client) {
        this.connectedPorts.delete(client.id);
        if (this.client.id == client.id) {
            this.client = null;
            this.emit('disconnected');
        }
        if (this.connectedPorts.size > 0) {
            const nextClient = this.connectedPorts.values().next().value;
            this.connect(nextClient);
        }
    }

    public connect(client: Client) {
        this.connectedPorts.set(client.id, client);
        if (this.client) return;
        this.client = client;
        this.emit('connected');
    }

    public postMessage(data: any) {
        if (!this.client) throw new Error(`disconnected`);
        this.client.postMessage({
            namespace: this.namespace,
            data: data
        });
    }

}