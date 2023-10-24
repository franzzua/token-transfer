import {Contract, ethers, JsonRpcApiProvider} from "ethers";
import {Transfer} from "../stores/transfers.store";
import {abi, ERC20} from "erc20-compiled";
import {etherium} from "../../test/test.container";
export class TransferApi {

    // private provider = new ethers.BrowserProvider(window.ethereum);
    constructor(private provider: JsonRpcApiProvider) {
    }

    private async getContract(tokenAddress: string, account: string = undefined): Promise<ERC20>{
        const signer = await this.provider.getSigner(account);
        return new Contract(tokenAddress, abi, signer) as Contract&ERC20;

    }

    async *run(transfer: Transfer): AsyncGenerator<Transfer> {
        yield { ...transfer, state: 'pending' };
        try {
            const erc20 = await this.getContract(transfer.tokenAddress, transfer.from);
            const transaction = await erc20.transfer(transfer.to, transfer.amount);
            if (transaction.isMined()) {
                yield { ...transfer, state: 'mined' };
            } else {
                yield { ...transfer, state: 'signed' };
                await transaction.wait();
                yield { ...transfer, state: 'mined' };
            }
        } catch (e) {
            yield {...transfer, state: 'rejected'};
        }
    }

    async estimateGas(transfer: Transfer): Promise<bigint> {
        const erc20 = await this.getContract(transfer.tokenAddress);
        return await erc20.transfer.estimateGas(transfer.to, transfer.amount);
    }

    async getBalance(tokenAddress: string, from: string) {
        const erc20 = await this.getContract(tokenAddress);
        return erc20.balanceOf(from);
    }

    async getFeeData(){
        const feeData = await this.provider.getFeeData();
        const currentBlock = await this.provider.getBlock('pending');
        const transaction = await currentBlock.getTransaction(0);

        const baseFeePerGas = currentBlock.baseFeePerGas;
        return {
            baseFeePerGas,
            ...feeData,
        }
    }
}