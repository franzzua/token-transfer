const provider = window.ethereum;
const button = document.getElementById('connect') as HTMLButtonElement;
const loader = document.getElementById('loader');

if (!provider){
    button.disabled = true;

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

    loader.style.display = 'none';
    provider.request({method: "eth_accounts"}).then(notifyEthereumState);
    button.style.display = 'initial';
    button.addEventListener('click', connect);
}
