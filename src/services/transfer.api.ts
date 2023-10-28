import {Contract, ethers, JsonRpcApiProvider} from "ethers";
import {AccountStore} from "../stores/account.store";
import {abi, ERC20} from "erc20-compiled";
import {etherium} from "../../test/test.container";
export class TransferApi {

    // private provider = new ethers.BrowserProvider(window.ethereum);
    constructor(private providerFactory: (chainId: number) => JsonRpcApiProvider,
                private accountStore: AccountStore) {
    }

    private get provider(){
        return this.providerFactory(this.accountStore.chainId)
    }

    private async getContract(tokenAddress: string, account: string = undefined): Promise<ERC20>{
        const signer = await this.provider.getSigner(account);
        return new Contract(tokenAddress, abi, signer) as Contract&ERC20;

    }

    async *run(transfer: Transfer, maxPriorityFeePerGas: bigint): AsyncGenerator<Transfer['state']> {
        const currentBlock = await this.provider.getBlock('pending');
        yield 'pending';
        try {
            const erc20 = await this.getContract(transfer.tokenAddress, this.accountStore.me);
            const transaction = await erc20.transfer(transfer.to, transfer.amount, {
                maxFeePerGas: maxPriorityFeePerGas + currentBlock.baseFeePerGas
            });
            if (transaction.isMined()) {
                yield 'mined';
            } else {
                yield 'signed';
                await transaction.wait();
                yield 'mined';
            }
        } catch (e) {
            yield 'rejected';
        }
    }

    async estimateGas(tokenAddress: string, to: string, amount: bigint, from: string): Promise<bigint> {
        const erc20 = await this.getContract(tokenAddress, from);
        return await erc20.transfer.estimateGas(to, amount);
    }

    async getBalance(tokenAddress: string, from: string) {
        const erc20 = await this.getContract(tokenAddress);
        return erc20.balanceOf(from);
    }

    async getFeeData(){
        const feeData = await this.provider.getFeeData();
        const currentBlock = await this.provider.getBlock('pending');

        const baseFeePerGas = currentBlock.baseFeePerGas;
        return {
            baseFeePerGas,
            ...feeData,
        }
    }

    async getTokenInfo(tokenAddress: string) {
        const contract = await this.getContract(tokenAddress);
        const decimals = await contract.decimals();
        const name = await contract.name();
        const symbol = await contract.symbol();
        return {
            decimals, name, symbol
        }
    }
}