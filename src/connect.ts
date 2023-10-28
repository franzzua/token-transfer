(async () => {
    const provider = window.ethereum;
    async function connect(){
        button.disabled = true;
        if (!provider) return;
        await provider.request<string[]>({ method: 'eth_requestAccounts' }).catch(() => {
            // rejected and ok
        });
        button.disabled = false;
    }
    const button = document.getElementById('connect') as HTMLButtonElement;
    if (!provider){
        button.disabled = true;
        return;
    }
    provider.addListener('accountsChanged', notifyEthereumState);
    async function notifyEthereumState(accounts: string[]){
        if (!window.TokenTransferApp){
            await new Promise(resolve => window.addEventListener('init', resolve, {once: true}));
        }
        if (accounts.length > 0) {
            window.TokenTransferApp.start();
        } else {
            window.TokenTransferApp.stop();
        }
    }
    const accounts = await provider.request({method: "eth_accounts"}) as string[];
    notifyEthereumState(accounts);
    button.addEventListener('click', connect);
})();