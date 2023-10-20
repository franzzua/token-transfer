import "./polyfills";
import {render} from "preact";
import {Main} from "./pages/main";

window.addEventListener('init', async () => {
  render(<Main/>, document.getElementById('root'));
  document.getElementById("start").remove();
  document.getElementById('root').style.display = 'initial';
});
