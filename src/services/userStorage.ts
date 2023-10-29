import {cell} from "@cmmn/cell/lib";
import {ObservableDB} from "../helpers/observableDB";

export class UserStorage {

    @cell
    public transfers = new ObservableDB<Transfer>("transfers");

    @cell
    public tokens = new ObservableDB<Omit<TokenInfo, "address"> & {
        _id: string;
    }>("tokens");
}