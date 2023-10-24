export class EtherscanApi {
    private token = 'BXIJHCBR52YXDCIE1YV6G9TUT2GAX2KBIB';
    private apiUrl = 'https://api.etherscan.io/api';

    public async getEstimationTime(gasprice: bigint){
        const {result} = await fetch(this.apiUrl + '?' + new URLSearchParams({
            module: 'gastracker',
            action: 'gasestimate',
            gasprice: gasprice.toString(10),
            apikey: this.token
        })).then(x => x.json());
        return result;
    }
    public async getGasPrices(){
        const result = await fetch(this.apiUrl + '?' + new URLSearchParams({
            module: 'gastracker',
            action: 'gasoracle',
            apikey: this.token
        })).then(x => x.json());
        return {
            low: result.result.SafeGasPrice,
            middle: result.result.ProposeGasPrice,
            high: result.result.FastGasPrice
        }
    }
}