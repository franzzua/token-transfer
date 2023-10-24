import { Transfer } from "./transfers.store";

export abstract class BaseTransferStore{
    public abstract get Transfer(): Transfer;
    public abstract get Amount(): string;
    public abstract set Amount(value: string);
    public abstract get errors(): Record<keyof Transfer, string | undefined>;
    public abstract patch(diff: Partial<Transfer>): Promise<void>;

}