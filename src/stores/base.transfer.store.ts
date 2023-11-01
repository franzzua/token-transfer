import {AsyncCell} from "@cmmn/cell/lib";
import {TokensStore} from "./tokens.store";

export abstract class BaseTransferStore{

    protected constructor(
        protected tokensStore: TokensStore,
    ) {
    }

    public abstract get Transfer(): Pick<Transfer, "amount"|"tokenAddress">;
    public Amount = new AsyncCell(() => this.tokensStore.parseTokenAmount(
        this.Transfer.tokenAddress, this.Transfer.amount
    ))

    public TokenInfo = new AsyncCell<TokenInfo | undefined>(async () => {
        if (!this.Transfer) return null;
        return this.tokensStore.getTokenInfo(this.Transfer.tokenAddress)
    })
}