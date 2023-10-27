import "./polyfills";
import {createRoot, Root} from "react-dom/client";

import {App} from "./app/app";

const start = document.getElementById("start");
const root = document.getElementById('root');
let reactRoot: Root;

window.addEventListener('ethereum_connected', show);
window.addEventListener('ethereum_disconnected', hide);
function show(){
  reactRoot = createRoot(root);
  reactRoot.render(<App/>);
  start.remove();
  root.style.display = 'initial';
}

 function hide(){
   reactRoot.unmount();
   document.body.appendChild(start);
   root.style.display = 'none';
 }
(async function (){
  const accounts = await window.ethereum.request({method: "eth_accounts"}) as string[];
  if (accounts.length > 0)
    show();
})();
