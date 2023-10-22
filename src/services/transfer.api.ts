import {Contract, ethers, JsonRpcApiProvider} from "ethers";
import {Transfer} from "../stores/transaction.store";
import {abi, TestToken, TestTokenFactory} from "erc20-compiled";
export class TransferApi {

    // private provider = new ethers.BrowserProvider(window.ethereum);
    constructor(private provider: JsonRpcApiProvider) {
    }

    private async getContract(tokenAddress: string): Promise<TestToken>{
        const signer = await this.provider.getSigner();
        return new Contract(tokenAddress, abi, signer) as Contract&TestToken;

    }

    async *run(transfer: Transfer): AsyncGenerator<Transfer> {
        const erc20 = await this.getContract(transfer.tokenAddress);
        // const gas = await erc20.transfer.estimateGas(transfer.to, transfer.amount);
        await erc20.transfer(transfer.to, transfer.amount);
    }

    async cancel(transaction: Transfer): Promise<void> {

    }
    async getBalance(tokenAddress: string, from: string) {
        const erc20 = await this.getContract(tokenAddress);
        return erc20.balanceOf(from);
    }
}