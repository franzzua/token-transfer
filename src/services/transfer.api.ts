import {Contract, JsonRpcApiProvider} from "ethers";
import {AccountStore} from "../stores/account.store";
import {abi} from "erc20-compiled";
import type {ERC20} from "erc20-compiled";

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

    private async getTransaction(transfer: Transfer, maxPriorityFeePerGas: bigint){
        const currentBlock = await this.provider.getBlock('pending');
        if (!transfer.tokenAddress){
            const signer = await this.provider.getSigner(this.accountStore.me);
            return await signer.sendTransaction({
                to: transfer.to, value: transfer.amount,
                maxFeePerGas: maxPriorityFeePerGas + currentBlock.baseFeePerGas
            });
        }
        const erc20 = await this.getContract(transfer.tokenAddress, this.accountStore.me);
        return  await erc20.transfer(transfer.to, transfer.amount, {
            maxFeePerGas: maxPriorityFeePerGas + currentBlock.baseFeePerGas
        });
    }
    async *run(transfer: Transfer, maxPriorityFeePerGas: bigint): AsyncGenerator<Transfer['state']> {
        yield 'pending';
        try {
            const transaction = await this.getTransaction(transfer, maxPriorityFeePerGas);
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
        if (!tokenAddress){
            const signer = await this.provider.getSigner(from);
            return await signer.estimateGas({
                to, value: amount
            });
        }
        const erc20 = await this.getContract(tokenAddress, from);
        return await erc20.transfer.estimateGas(to, amount);
    }

    async getBalance(tokenAddress: string) {
        if (!tokenAddress)
            return this.provider.getBalance(this.accountStore.me);
        const erc20 = await this.getContract(tokenAddress);
        return erc20.balanceOf(this.accountStore.me);
    }

    async getTokenInfo(tokenAddress: string): Promise<{
        decimals: number;
        name: string;
        symbol: string;
    }> {
        const contract = await this.getContract(tokenAddress);
        const decimals = await contract.decimals();
        const name = await contract.name();
        const symbol = await contract.symbol();
        return {
            decimals: Number(decimals), name, symbol
        }
    }
}