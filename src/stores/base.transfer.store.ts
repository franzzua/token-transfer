import {AsyncCell} from "@cmmn/cell/lib";
import {TransferApi} from "../services/transfer.api";
import {TokensStore} from "./tokens.store";

export abstract class BaseTransferStore{

    protected constructor(
        protected api: TransferApi,
        protected tokensStore: TokensStore,
    ) {
    }

    public abstract get Transfer(): Transfer;
    public abstract get Amount(): string;
    public abstract set Amount(value: string);
    public abstract get errors(): Record<keyof Transfer, string | undefined>;
    public abstract patch(diff: Partial<Transfer>): Promise<void>;

    public TokenInfo = new AsyncCell<TokenInfo | undefined>(async () => {
        return this.tokensStore.getTokenInfo(this.Transfer.tokenAddress)
    })
}