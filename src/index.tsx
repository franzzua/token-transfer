import "./polyfills";
import {render} from "preact";
import {Main} from "./pages/main";

const start = document.getElementById("start");
const root = document.getElementById('root');

window.addEventListener('accountsChanged', async (e: CustomEvent<string[]>) => {
  if (e.detail.length > 0 && root.style.display == 'none') {
    render(<Main/>, root);
    start.remove();
    root.style.display = 'initial';
  }
  if (e.detail.length == 0 && root.style.display == 'initial') {
    document.body.appendChild(start);
    root.style.display = 'none';
  }
});
