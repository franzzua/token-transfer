import {AsyncCell} from "@cmmn/cell/lib";
import {EtherscanApi} from "../services/etherscanApi";
import {Timer} from "../helpers/timer";

export class ChainStore{

    constructor(private api: EtherscanApi) {
    }

    private timer = new Timer(30000);

    public gasPrices = new AsyncCell(() => this.timer.get() && this.api.getGasPrices());

    public gasTimes = new AsyncCell(async () => {
        const prices = this.gasPrices.get();
        if (!prices) return null;
        return {
            low: await this.api.getEstimationTime(BigInt(prices.low)*(10n**9n)),
            middle: await this.api.getEstimationTime(BigInt(prices.middle)*(10n**9n)),
            high: await this.api.getEstimationTime(BigInt(prices.high)*(10n**9n)),
        }
    })

}