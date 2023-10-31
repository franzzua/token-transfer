import {AsyncCell} from "@cmmn/cell/lib";
import {TransferApi} from "../services/transfer.api";
import {TokensStore} from "./tokens.store";
import {formatUnits, parseUnits} from "ethers/utils";

export abstract class BaseTransferStore{

    protected constructor(
        protected api: TransferApi,
        protected tokensStore: TokensStore,
    ) {
    }

    public abstract get Transfer(): Transfer;
    public get Amount(): bigint | null{
        if (!this.TokenInfo.get()) return null;
        if (!this.Transfer.amount) return null;
        const truncate = truncateUpTo18DigitsAfterDot(this.Transfer.amount.replace(",","."))?.[0];
        try {
            return parseUnits(truncate, this.TokenInfo.get().decimals);
        }catch (e){
            return null;
        }
    }


    public abstract get errors(): Record<keyof Transfer, string | undefined>;
    public abstract patch(diff: Partial<Transfer>);

    public TokenInfo = new AsyncCell<TokenInfo | undefined>(async () => {
        return this.tokensStore.getTokenInfo(this.Transfer.tokenAddress)
    })
}

function truncateUpTo18DigitsAfterDot(number) {
    return number.match(/^(\d*([.,]\d{0,18})?)/g);
}