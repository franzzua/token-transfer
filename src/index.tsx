import "./polyfills";
import {render} from "preact";

import {App} from "./app/app";
import {transactionReader} from "./services/transacton-reader";

const startElement = document.getElementById("start");
const root = document.getElementById('root');

window.TokenTransferApp = {
    isStarted: false,
    start() {
        if (this.isStarted) return;
        this.isStarted = true;
        render(<App/>, root);
        startElement.remove();
        root.style.display = 'flex';
        transactionReader.start();
    }, stop() {
        if (!this.isStarted) return;
        this.isStarted = false;
        // reactRoot.unmount();
        document.body.appendChild(startElement);
        root.style.display = 'none';
        transactionReader.stop();
    }
}

