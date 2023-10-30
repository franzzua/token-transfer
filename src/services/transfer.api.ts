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

    private async getTransaction(transfer: TransferSent){
        const currentBlock = await this.provider.getBlock('pending');
        if (!transfer.tokenAddress){
            const signer = await this.provider.getSigner(transfer.from);
            return await signer.sendTransaction({
                to: transfer.to, value: transfer.amount,
                maxFeePerGas: transfer.fee + currentBlock.baseFeePerGas,
                maxPriorityFeePerGas: transfer.fee
            });
        }
        const erc20 = await this.getContract(transfer.tokenAddress, transfer.from);
        return  await erc20.transfer(transfer.to, transfer.amount, {
            maxFeePerGas: transfer.fee + currentBlock.baseFeePerGas,
            maxPriorityFeePerGas: transfer.fee
        });
    }
    async run(tokenAddress: string, to: string, amount: bigint, maxPriorityFeePerGas: bigint): Promise<TransferSent> {
        const sentTransfer = {
            tokenAddress: tokenAddress,
            chainId: this.accountStore.chainId,
            to: to,
            from: this.accountStore.me,
            fee: maxPriorityFeePerGas,
            amount,
            state: 'pending',
            blockHash: null,
            nonce: null,
            _id: undefined,
        } as TransferSent;
        const transaction = await this.getTransaction(sentTransfer);
        sentTransfer._id = transaction.hash;
        sentTransfer.blockHash = transaction.blockHash;
        sentTransfer.nonce = transaction.nonce;
        sentTransfer.state = 'signed';
        return sentTransfer;
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

    async getTokenInfo(tokenAddress: string, chainId: number): Promise<{
        decimals: number;
        name: string;
        symbol: string;
    }> {
        const contract = new Contract(tokenAddress, abi) as Contract&ERC20;
        const decimals = await contract.decimals({
            chainId
        });
        const name = await contract.name({
            chainId
        });
        const symbol = await contract.symbol({
            chainId
        });
        return {
            decimals: Number(decimals), name, symbol
        }
    }

    async getTransactionState(hash: string): Promise<Pick<TransferSent, "state"|"fee">> {
        // TODO: get transaction from another chain
       const transaction = await this.provider.getTransaction(hash);
       return {
           state: transaction.isMined() ? 'mined': 'signed',
           fee: transaction.maxPriorityFeePerGas
       };
    }
}