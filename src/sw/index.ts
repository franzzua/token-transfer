import {ethereumSw} from "../services/transacton-reader/ethereum-sw";
import {TransactionReader} from "../services/transacton-reader/transaction.reader";
import { SwStorage } from "./sw-storage";
import { ServiceWorkerAction } from "./actions";

declare var self: ServiceWorkerGlobalScope;

const storage = new SwStorage("root");
const transactionReader = new TransactionReader();
self.addEventListener("install", (event) => {
  // event.waitUntil(caches.delete('root').catch())
});
self.addEventListener("activate", (event) => {
  self.skipWaiting();
});
self.addEventListener("fetch", async (event) => {
  try {
    if (event.request.url.match(".reload")) {
      await storage.clear();
    }
    event.respondWith(storage.getResponse(event.request));
  } catch (e) {
    console.error(e);
  }
});

self.addEventListener("message", (event) => {
  try {
    switch (event.data?.action as ServiceWorkerAction) {
      case "reload":
        storage.clear().then((x) => storage.load());
        break;
      case "check":
        storage.checkUpdate(event.data.force);
        break;
      case "init":
        storage.isIOS = event.data.isIOS;
        storage
          .load()
          .catch()
          .then(() => self.clients.claim())
          .then(() => {
            event.source.postMessage({
              action: "init" as ServiceWorkerAction,
            });
          });
        break;
      case "ethereum_connect":
        ethereumSw.connector.connect(event.source as MessagePort);
        break;
      case "ethereum_disconnect":
        ethereumSw.connector.disconnect(event.source as MessagePort);
        break;
    }
  } catch (e) {
    console.error(e);
  }
});
