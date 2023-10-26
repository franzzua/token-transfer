"use strict";

const sw = "/sw.js";
if (navigator.serviceWorker && !location.href.match("(localhost)")) {
  const upgradeInterval = 5*60*1000; // 5 minutes

  const handle = (globalThis.ServiceWorkerHandle = {
    event: null as BeforeInstallPromptEvent,
    worker: navigator.serviceWorker.controller,
    // size: 0,
    // get percent() {
    //   return this.size / 1372629;
    // },
    // reload() {
    //   this.worker.postMessage({
    //     action: "reload" as ServiceWorkerAction,
    //   });
    // },
    // check(force: boolean) {
    //   this.worker.postMessage({
    //     action: "check" as ServiceWorkerAction,
    //     force,
    //   });
    // },
  });
  setInterval(
    () =>
      handle.worker?.postMessage({
        action: "check",
      }),
      upgradeInterval
  );

  // const isFirstInstall = !(
  //   navigator.serviceWorker.controller instanceof ServiceWorker
  // ); // при первой установке на клиенте еще нет sw

  // if (location.pathname.match(/\.reload/)) {
  //   localStorage.clear();
  //   document.cookie = "";
  //   navigator.serviceWorker
  //     .getRegistration()
  //     .then((x) => x?.unregister())
  //     .catch()
  //     .then(() => indexedDB.databases())
  //     .then((x) => {
  //       for (let db of x) {
  //         indexedDB.deleteDatabase(db.name);
  //       }
  //       indexedDB.deleteDatabase('versions');
  //     })
  //     .catch()
  //     .then(() => location.pathname = '/');
  // }
  if (navigator.serviceWorker.controller) {
    const isIOS = CSS.supports("-webkit-touch-callout", "none");
    navigator.serviceWorker.controller.postMessage({
      action: "init",
      isIOS: isIOS,
    });
  } else {
    navigator.serviceWorker.register(sw, { scope: "/" }).then((reg) => {
      reg.addEventListener("updatefound", () => {
        // A wild service worker has appeared in reg.installing!
        const newWorker = reg.installing;

        // "installing" - the install event has fired, but not yet complete
        // "installed"  - install complete
        // "activating" - the activate event has fired, but not yet complete
        // "activated"  - fully active
        // "redundant"  - discarded. Either failed install, or it's been
        //                replaced by a newer version

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

  // navigator.serviceWorker.addEventListener("controllerchange", () => {
  //   console.log(navigator.serviceWorker.controller);
  //   // This fires when the service worker controlling this page
  //   // changes, eg a new worker has skipped waiting and become
  //   // the new active worker.
  // });

  navigator.serviceWorker.addEventListener("message", ({ data }) => {
    switch (data.action) {
      // case "loading":
      // handle.size += data.size;
      // console.log(`${data.cache}: +${data.size} (${data.url})`);
      // break;

      case "init":
        setTimeout(() => {
          init().catch(console.error);
        }, Math.max(3000 - performance.now(), 0))
        break;
      case "new-version":
        console.log("app has new version");
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
    if (['/loader.js', '/sw.js', '/global.less'].includes(asset))
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

function preloader(){
  const svg = document.getElementById('bg');
  function addStar(){
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href","#star");
    use.setAttribute("transform", `translate(${Math.random()*100}, ${Math.random()*100}) scale(${Math.random()*0.3})`);
    svg.appendChild(use);
    if (Math.random() > 1 - svg.childElementCount/50){
      svg.querySelector('use').remove();
    }
    setTimeout(addStar, Math.random()*1000);
  }
  addStar();
}

preloader();
