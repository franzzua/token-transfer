import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5';

const provider = window.ethereum;
const button = document.getElementById('connect') as HTMLButtonElement;
const loader = document.getElementById('loader');

// const web3Modal = new WalletConnectModalSign({
//     projectId: '4489459e56ec630d406a7cab1e3a3fec',
//     metadata: {
//         name: "Token Transfer",
//         description: "Transfer token fast",
//         url: location.origin,
//         icons: [`${location.origin}/public/icons/icon.svg`],
//     },
// });

const modal = createWeb3Modal({
    ethersConfig: defaultConfig({
        metadata: {
            name: 'My Website',
            description: 'My Website description',
            url: 'https://mywebsite.com',
            icons: ['https://avatars.mywebsite.com/']
        }
    }),
    chains: [{
        chainId: 1,
        name: 'Ethereum',
        currency: 'ETH',
        explorerUrl: 'https://etherscan.io',
        rpcUrl: 'https://cloudflare-eth.com'
    }],
    projectId: '4489459e56ec630d406a7cab1e3a3fec',
})

// if (!provider){
//     button.disabled = true;
//
// } else {
    // provider.addListener('accountsChanged', notifyEthereumState);
    async function connect(){
        loader.style.display = 'initial';
        button.style.display = 'none';
        await modal.open({
            view: "Connect"
        });
        // globalThis.ethereum = await EthereumProvider.init({
        //     projectId: '4489459e56ec630d406a7cab1e3a3fec',
        //     showQrModal: true,
        //     qrModalOptions: { themeMode: "light" },
        //     chains: [1],
        //     methods: ["eth_sendTransaction", "personal_sign"],
        //     events: ["chainChanged", "accountsChanged"],
        //     metadata: {
        //         name: "My Dapp",
        //         description: "My Dapp description",
        //         url: "https://my-dapp.com",
        //         icons: ["https://my-dapp.com/logo.png"],
        //     },
        // });
        // const session = await web3Modal.connect({
            // requiredNamespaces: {
            //     eip155: {
            //         methods: ["eth_sendTransaction", "personal_sign"],
            //         chains: ["eip155:1"],
            //         events: ["chainChanged", "accountsChanged"],
            //     },
            // },

        // }).catch();
        // await provider.request<string[]>({ method: 'eth_requestAccounts' }).catch(() => {
            // rejected and ok
        // });
        button.style.display = 'initial';
        loader.style.display = 'none';
    }
    async function notifyEthereumState(accounts: string[]) {
        if (!window.TokenTransferApp) {
            loader.style.display = 'initial';
            button.style.display = 'none';
            await new Promise(resolve => window.addEventListener('init', resolve, {once: true}));
            button.style.display = 'initial';
            loader.style.display = 'none';
        }
        if (accounts.length > 0) {
            window.TokenTransferApp.start();
        } else {
            window.TokenTransferApp.stop();
        }
    }


    window.addEventListener('visibilitychange', e => {
        if (document.visibilityState == 'visible'){
            provider.request({method: "eth_accounts"}).then(notifyEthereumState);
        } else {
            notifyEthereumState([]);
        }
    });

    window.addEventListener('resume', () => {
    })

    loader.style.display = 'none';
    // provider.request({method: "eth_accounts"}).then(notifyEthereumState);
    button.style.display = 'initial';
    button.addEventListener('click', connect);
// }
