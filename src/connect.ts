const provider = window.ethereum;
const button = document.getElementById('connect') as HTMLButtonElement;
const loader = document.getElementById('loader');

if (!provider){
    button.disabled = true;
    button.innerHTML = `Please install MetaMask extension to use TokenTransfer`;
    button.style.display = 'initial';
    loader.style.display = 'none';
} else {
    provider.addListener('accountsChanged', notifyEthereumState);
    async function connect(){
        loader.style.display = 'initial';
        button.style.display = 'none';
        await provider.request<string[]>({ method: 'eth_requestAccounts' }).catch(() => {
            // rejected and ok
        });
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
    provider.request({method: "eth_accounts"}).then(notifyEthereumState);
    button.style.display = 'initial';
    button.addEventListener('click', connect);
}
