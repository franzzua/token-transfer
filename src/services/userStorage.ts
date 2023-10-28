import {cell} from "@cmmn/cell/lib";
import {ObservableDB} from "../helpers/observableDB";
import {Transfer} from "../stores/transfer.store";

export class UserStorage {

    @cell
    public transfers = new ObservableDB<Transfer>("transfers");

    @cell
    public tokens = new ObservableDB<Transfer>("tokens");
}