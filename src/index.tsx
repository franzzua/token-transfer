import "./polyfills";
import {createRoot, Root} from "react-dom/client";

import {App} from "./app/app";
import {transactionReader} from "./services/transacton-reader";

const startElement = document.getElementById("start");
const root = document.getElementById('root');
let reactRoot: Root;

window.TokenTransferApp = {
    isStarted: false,
    start() {
        if (this.isStarted) return;
        this.isStarted = true;
        reactRoot = createRoot(root);
        reactRoot.render(<App/>);
        startElement.remove();
        root.style.display = 'initial';
        transactionReader.start();
    }, stop() {
        if (!this.isStarted) return;
        this.isStarted = false;
        reactRoot.unmount();
        document.body.appendChild(startElement);
        root.style.display = 'none';
        transactionReader.stop();
    }
}