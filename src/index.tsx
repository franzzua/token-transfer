import "./polyfills";
import {render} from "preact";

window.addEventListener('init', async () => {
  render(<>Hello</>, document.getElementById('root'));
  document.getElementById("start").remove();
  document.getElementById('root').style.display = 'initial';
});
