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
    function notifyEthereumState(accounts: string[]){
        if (accounts.length > 0) {
            window.dispatchEvent(new CustomEvent("ethereum_connected"));
        }else{
            window.dispatchEvent(new CustomEvent("ethereum_disconnected"));
        }
    }
    const accounts = await provider.request({method: "eth_accounts"}) as string[];
    notifyEthereumState(accounts);
    button.addEventListener('click', connect);
})();