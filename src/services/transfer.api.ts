import {EventEmitter, Injectable} from "@cmmn/cell/lib";
import {Inject} from "@cmmn/cell/lib";
import {ContractTransaction, Transaction} from "ethers";
import {providers} from "ethers";
import {Contract} from "ethers";
import {ProviderInjectionToken} from "../container";
import {AccountService} from "./accountService";
import {abi} from "erc20-compiled";
import type {ERC20} from "erc20-compiled";

@Injectable()
export class TransferApi extends EventEmitter<{
    tx_replacement: {oldHash: string, newHash: string, newTransaction: Transaction}
    tx_cancelled: {oldHash: string}
    tx_mined: {hash: string}
}>{

    // private provider = new ethers.BrowserProvider(window.ethereum);
    constructor(@Inject(ProviderInjectionToken) private providerFactory: (chainId: number) => providers.JsonRpcProvider,
                @Inject(AccountService) private accountStore: AccountService) {
        super();
        this.provider.on('tx_cancelled', e => {
            console.log(e);
            this.emit('tx_cancelled', e)
        });
        this.provider.on('tx_mined', e => {
            console.log(e);
            this.emit('tx_mined', e)
        });
        this.provider.on('tx_replacement', e => {
            console.log(e);
            this.emit('tx_replacement', e)
        });
    }

    private get provider(){
        return this.providerFactory(this.accountStore.chainId)
    }

    private async getContract(tokenAddress: string, account: string = undefined): Promise<ERC20>{
        const signer = await this.provider.getSigner(account);
        return new Contract(tokenAddress, abi, signer) as Contract&ERC20;

    }

    private async getTransaction(transfer: TransferSent): Promise<providers.TransactionResponse>{
        const currentBlock = await this.provider.getBlock('pending');
        if (!transfer.tokenAddress){
            const signer = await this.provider.getSigner(transfer.from);
            return await signer.sendTransaction({
                to: transfer.to, value: transfer.amount,
                maxFeePerGas: transfer.maxPriorityFeePerGas + currentBlock.baseFeePerGas.toBigInt(),
                maxPriorityFeePerGas: transfer.maxPriorityFeePerGas,
            });
        }
        const erc20 = await this.getContract(transfer.tokenAddress, transfer.from);
        return  await erc20.transfer(transfer.to, transfer.amount, {
            maxFeePerGas: transfer.maxPriorityFeePerGas + currentBlock.baseFeePerGas.toBigInt(),
            maxPriorityFeePerGas: transfer.maxPriorityFeePerGas
        });
    }
    async run(tokenAddress: string, to: string, amount: bigint, maxPriorityFeePerGas: bigint): Promise<TransferSent> {
        const sentTransfer = {
            tokenAddress: tokenAddress,
            chainId: this.accountStore.chainId,
            to: to,
            timestamp: +new Date()/1000,
            from: this.accountStore.me,
            maxPriorityFeePerGas: maxPriorityFeePerGas,
            initialMaxPriorityFeePerGas: maxPriorityFeePerGas,
            amount,
            state: 'pending',
            blockHash: null,
            nonce: null,
            _id: undefined,
        } as TransferSent;
        const transaction = await this.getTransaction(sentTransfer);
        sentTransfer._id = transaction.hash;
        transaction.wait().then(res => {
            this.emit('tx_mined', {
                hash: transaction.hash,
            });
        }).catch(err => {
            if (err.cancelled) {
                this.emit('tx_cancelled', {
                    oldHash: transaction.hash,
                });
            } else if (err.replacement) {
                this.emit('tx_replacement', {
                    oldHash: transaction.hash,
                    newHash: err.replacement.hash,
                    newTransaction: err.replacement
                });
            }
        });
        return sentTransfer;
    }

    async estimateGas(tokenAddress: string, to: string, amount: bigint, from: string): Promise<bigint> {
        if (!tokenAddress){
            const signer = await this.provider.getSigner(from);
            return await signer.estimateGas({
                to, value: 0n
            }).then(x => x.toBigInt());
        }
        const erc20 = await this.getContract(tokenAddress, from);
        return await erc20.transfer.estimateGas(to, amount);
    }

    async getBalance(tokenAddress: string): Promise<bigint> {
        if (!tokenAddress)
            return this.provider.getBalance(this.accountStore.me).then(x => x.toBigInt());
        const erc20 = await this.getContract(tokenAddress);
        return erc20.balanceOf(this.accountStore.me);
    }

    async getTokenInfo(tokenAddress: string, chainId: number): Promise<{
        decimals: number;
        name: string;
        symbol: string;
    }> {
        const contract = await this.getContract(tokenAddress, this.accountStore.me);
        const decimals = await contract.decimals({chainId});
        const name = await contract.name({chainId});
        const symbol = await contract.symbol({chainId});
        return {
            decimals: Number(decimals), name, symbol
        }
    }

    async replace(hash: string,
            from: string,
            maxPriorityFeePerGas: bigint) {
        const block = await this.provider.getBlock('pending');
        const transaction = await this.provider.getTransaction(hash);
        const signer = await this.provider.getSigner(from);
        console.log(transaction);
        await signer.sendTransaction({
            to: transaction.to,
            value: transaction.value,
            from: transaction.from,
            chainId: transaction.chainId,
            nonce: transaction.nonce,
            type: transaction.type,
            data: transaction.data,
            accessList: transaction.accessList,
            gasLimit: transaction.gasLimit,
            gasPrice: undefined,
            maxPriorityFeePerGas: maxPriorityFeePerGas,
            maxFeePerGas: maxPriorityFeePerGas + block.baseFeePerGas.toBigInt()
        });
    }
}