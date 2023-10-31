import {Injectable} from "@cmmn/cell/lib";
import {cell} from "@cmmn/cell/lib";
import {ObservableDB} from "../helpers/observableDB";

@Injectable()
export class UserStorage {

    @cell
    public transfers = new ObservableDB<Transfer>("transfers");
    @cell
    public sentTransfers = new ObservableDB<TransferSent>("sentTransfers");

    @cell
    public tokens = new ObservableDB<Omit<TokenInfo, "address"> & {
        _id: string;
    }>("tokens");
}