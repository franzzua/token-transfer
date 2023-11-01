import "./polyfills";
import {render} from "preact";

import {App} from "./ui/app";
import {TransactionReader} from "@transaction-reader";

const startElement = document.getElementById("start");
const root = document.getElementById('root');
const transactionReader = new TransactionReader();

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

