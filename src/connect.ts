(async () => {
    const provider = window.ethereum;
    async function connect(){
        button.disabled = true;
        if (!provider) return;
        const result = await provider.request<string[]>({ method: 'eth_requestAccounts' });
        // window.dispatchEvent(new CustomEvent<string[]>("accountsChanged", {
        //     detail: result
        // }));
        button.disabled = false;
    }
    const button = document.getElementById('connect') as HTMLButtonElement;
    if (!provider){
        button.disabled = true;
        return;
    }
    provider.addListener('accountsChanged', (accounts: string[]) => {
        window.dispatchEvent(new CustomEvent<string[]>("accountsChanged", {
            detail: accounts
        }));
    });
    const accounts = await provider.request({method: "eth_accounts"}) as string[];
    if (accounts.length > 0){
        window.dispatchEvent(new CustomEvent<string[]>("accountsChanged", {
            detail: accounts
        }));
    }
    button.addEventListener('click', connect);
})();