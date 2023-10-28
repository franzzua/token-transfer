import {TransferApi} from "../services/transfer.api";
import {UserStorage} from "../services/userStorage";
import {AccountStore} from "./account.store";

export class TokensStore {
    constructor(private storage: UserStorage,
                private accountStore: AccountStore,
                private api: TransferApi) {

    }

    public get Tokens() {
        return this.storage.tokens;
    }

    public get Balances(){
        return
    }
}