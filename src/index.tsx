import "./polyfills";
import {createRoot, Root} from "react-dom/client";

import {App} from "./app/app";
import {transactionReader} from "./services/transacton-reader";

const startElement = document.getElementById("start");
const root = document.getElementById('root');
let reactRoot: Root;

window.TokenTransferApp = {
    start() {
        reactRoot = createRoot(root);
        reactRoot.render(<App/>);
        startElement.remove();
        root.style.display = 'initial';
        transactionReader.start();
    }, stop() {
        reactRoot.unmount();
        document.body.appendChild(startElement);
        root.style.display = 'none';
        transactionReader.stop();
    }
}