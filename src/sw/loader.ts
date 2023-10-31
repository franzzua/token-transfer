"use strict";

import {preloader} from "./preloader";

const sw = "/sw.js";
if (!DEBUG) {
  const upgradeInterval = 5*60*1000; // 5 minutes

  const handle = (globalThis.ServiceWorkerHandle = {
    event: null as BeforeInstallPromptEvent,
    worker: navigator.serviceWorker.controller,
  });
  setInterval(
    () =>
      handle.worker?.postMessage({
        action: "check",
      }),
      upgradeInterval
  );

  if (navigator.serviceWorker.controller) {
    const isIOS = CSS.supports("-webkit-touch-callout", "none");
    navigator.serviceWorker.controller.postMessage({
      action: "init",
      isIOS: isIOS,
    });
    addEventListener('beforeunload', function (e) {
      if (!e.defaultPrevented) {
        navigator.serviceWorker.controller.postMessage({
          action: 'disconnect'
        })
      }
    })
  } else {
    navigator.serviceWorker.register(sw, { scope: "/" }).then((reg) => {
      reg.addEventListener("updatefound", () => {
        // A wild service worker has appeared in reg.installing!
        const newWorker = reg.installing;

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "activated") {
            handle.worker = newWorker;
            newWorker.postMessage({
              action: "init",
            });
          }
          // newWorker.state has changed
        });
      });
    });
  }

  navigator.serviceWorker.addEventListener("message", ({ data }) => {
    switch (data.action) {

      case "init":
        setTimeout(async () => {
          await init();
        }, Math.max(3000 - performance.now(), 0))
        break;
      case "new-version":
        navigator.serviceWorker
          .getRegistration()
          .then((x) => x?.unregister())
          .then(() => location.reload());
        break;
    }
  });

  window.addEventListener(
    "beforeinstallprompt",
    (e: BeforeInstallPromptEvent) => {
      handle.event = e;
    }
  );
} else {
  init().catch(console.error);
}
async function init() {
  const assets = await fetch("/assets.json").then(x => x.json()) as string[];
  const elements = [] as Array<HTMLScriptElement | HTMLLinkElement>;
  for (let asset of assets) {
    console.log(asset)
    if (['/loader.js', '/sw.js', '/global.less', '/connect.js'].includes(asset))
      continue;
    if (asset.endsWith("css")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = asset;
      elements.push(link);
    }
    if (asset.endsWith("js")) {
      const script = document.createElement("script");
      script.src = asset;
      elements.push(script);
    }
  }
  await Promise.all(
      elements.map(
          (x) =>
              new Promise((resolve) => {
                document.head.appendChild(x);
                x.addEventListener("load", resolve);
              })
      )
  );
    // animateLoading(0);
  window.dispatchEvent(new CustomEvent("init"));
}

preloader();

type BeforeInstallPromptEvent = Event & {
  /**
   * Returns an array of DOMString items containing the platforms on which the event was dispatched.
   * This is provided for user agents that want to present a choice of versions to the user such as,
   * for example, "web" or "play" which would allow the user to chose between a web version or
   * an Android version.
   */
  readonly platforms: Array<string>;

  /**
   * Returns a Promise that resolves to a DOMString containing either "accepted" or "dismissed".
   */
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;

  /**
   * Allows a developer to show the install prompt at a time of their own choosing.
   * This method returns a Promise.
   */
  prompt(): Promise<void>;
};
