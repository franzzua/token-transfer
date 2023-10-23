import {SyncStore} from "@cmmn/sync";
import {Transfer} from "../stores/transfer.store";

export class Storage extends SyncStore {
    constructor() {
        super("app");

    }

    public transfers = this.getArray<Transfer>("transfers");
    public tokens = this.getArray<Transfer>("tokens");
}