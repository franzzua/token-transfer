import "./polyfills";
import {createRoot} from "react-dom/client";

import {App} from "./app/app";

const start = document.getElementById("start");
const root = document.getElementById('root');

window.addEventListener('accountsChanged', async (e: CustomEvent<string[]>) => {
  if (e.detail.length > 0 && root.style.display == 'none') {
    show();
  }
  if (e.detail.length == 0 && root.style.display == 'initial') {
    hide();
  }
});
function show(){
  createRoot(root).render(<App/>);
  start.remove();
  root.style.display = 'initial';
}

 function hide(){
   document.body.appendChild(start);
   root.style.display = 'none';
 }
(async function (){
  const accounts = await window.ethereum.request({method: "eth_accounts"}) as string[];
  if (accounts.length > 0)
    show();
})();
