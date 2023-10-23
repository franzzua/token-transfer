import {ObservableDB} from "../helpers/observableDB";
import {Transfer} from "../stores/transfer.store";

export class TransferStorage extends ObservableDB<Transfer> {
    private channel = new BroadcastChannel(this.name);
    constructor() {
        super("transfers");

        this.channel.addEventListener('message', async e => {
            if (e.data?.key != 'change') return;
            switch (e.data.event?.type){
                case "addOrUpdate":
                    await this.addOrUpdate(e.data.event.value, true);
                    super.emit("change", e.data.event.value);
                    break;
            }
        })
    }

    public emit(key, event){
        super.emit(key, event);
        this.channel.postMessage({
            key, event
        });
    }
}