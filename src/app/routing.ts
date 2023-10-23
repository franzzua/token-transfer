import {Cell} from "@cmmn/cell";
import {compare} from "@cmmn/core";
import {useEffect} from "react";
import {useCell} from "../helpers/use-cell";
import {routes} from "./pages/routes";

export type RoutePath =
  | [keyof typeof routes, ...Array<string | number>]
  | [keyof typeof routes, ...Array<string | number>, Record<string, string>];
export type RoutePathString =
  | `/${keyof typeof routes}/${string}`
  | `/${keyof typeof routes}?${string}`
  | `/${keyof typeof routes}`;
const routeCell = new Cell<RoutePath>(
  location.pathname.split("/").slice(1) as RoutePath,
  { compare }
);
const queryCell = new Cell<Record<string, string>>(
  Object.fromEntries(new URL(location.href).searchParams.entries())
);

const back = history.back.bind(history);
export const routerCell = new Cell(() => {
  const route = routeCell.get();
  const query = queryCell.get()
  return {
    back,
    route,
    query,
    active: routes[route[0]] ?? routes.main,
    goTo,
  }
}, {compare})

function onRoutingChange(e: {oldValue: RoutePath, value: RoutePath} ){
  document.title = ["Token Transfer", routes[e.value[0]]?.title].filter(x => x).join(': ');
}
routeCell.on('change', onRoutingChange)

onRoutingChange({
  value: routeCell.get(),
  oldValue: [] as any
});
export const goTo = (
  path: RoutePath | RoutePathString,
  query: Record<string, string> | undefined = queryCell.get(),
  replace: boolean = false
) => {
  console.log(path, query)
  if (typeof path === "string") {
    const url = new URL(location.origin + path);
    path = url.pathname.split("/").slice(1) as RoutePath;
    query ??= Object.fromEntries(url.searchParams.entries());
  }
  if (typeof path[path.length - 1] === "object") {
    query = path.pop() as Record<string, string>;
  }
  routeCell.set(path.filter((x) => x !== null) as RoutePath);
  query && queryCell.set(query);
  let url = "/" + path.filter((x) => x !== null).join("/");
  const search = new URLSearchParams(query ?? queryCell.get()).toString();
  if (search) url += "?" + search;
  history[replace ? "replaceState" : "pushState"]({}, null, url);
};
window.addEventListener("popstate", () => {
  routeCell.set(location.pathname.split("/").slice(1) as RoutePath);
  queryCell.set(
    Object.fromEntries(new URL(location.href).searchParams.entries())
  );
  historyStateCell.set(history.state);
});
if (location.pathname === "/") {
  goTo(["main"], {}, true);
}

export function useRouter<TQuery extends Record<string, string> = {}>() {
  const router = useCell(routerCell);
  useEffect(() => {
    if (!routes[router.route[0]]) {
      goTo(["main"]);
    }
  }, [router.route[0]]);
  return router;
}
// history.scrollRestoration = "auto";
export const historyStateCell = new Cell<Record<string, any>>(
  {},
  {
    tap: (v) => {
      console.log(v);
      history.replaceState(v, "", location.href);
    },
  }
);