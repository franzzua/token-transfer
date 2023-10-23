import {Storage} from "../services/storage";

export class TokensStore {
    constructor(private storage: Storage) {

    }

    public get Tokens() {
        return this.storage.tokens;
    }
}