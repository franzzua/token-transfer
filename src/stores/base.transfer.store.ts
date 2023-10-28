import {AsyncCell} from "@cmmn/cell/lib";
import {TokenInfo, getTokenByAddress} from "../services/token.info";
import {TransferApi} from "../services/transfer.api";

export abstract class BaseTransferStore{

    protected constructor(
        protected api: TransferApi,
    ) {
    }

    public abstract get Transfer(): Transfer;
    public abstract get Amount(): string;
    public abstract set Amount(value: string);
    public abstract get errors(): Record<keyof Transfer, string | undefined>;
    public abstract patch(diff: Partial<Transfer>): Promise<void>;

    public TokenInfo = new AsyncCell<TokenInfo | undefined>(async () => {
        return getTokenByAddress(this.Transfer.tokenAddress) ??
            await this.api.getTokenInfo(this.Transfer.tokenAddress).catch(() => undefined);
    })
}