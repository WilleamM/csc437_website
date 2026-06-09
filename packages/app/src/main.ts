import { define, html } from "@unbndl/html";
import { Auth } from "@unbndl/auth";
import { Store } from "@unbndl/store";
import { BrowserHistory, Switch } from "@unbndl/switch";
import { WorkoutHeaderElement } from "./components/header.ts";
import { HomeViewElement } from "./views/home-view.ts";
import { WorkoutViewElement } from "./views/workout-view.ts";
import { Msg } from "./messages.ts";
import { Model, init } from "./model.ts";
import { update, Cmd } from "./update.ts";

const routes = [
  {
    path: "/app/workout/:id",
    view: html`<workout-view workout-id=${($: any) => $.params.id}></workout-view>`
  },
  {
    path: "/app",
    view: html`<home-view></home-view>`
  },
  {
    path: "/",
    redirect: "/app"
  }
];

define({
  "auth-provider": Auth.Provider,
  "history-provider": BrowserHistory.Provider,
  "store-provider": class AppStore extends Store.Provider<Model, Msg, Cmd> {
    constructor() {
      super(update, init);
    }
  },
  "wt-header": WorkoutHeaderElement,
  "home-view": HomeViewElement,
  "workout-view": WorkoutViewElement,
  "router-switch": class AppSwitch extends Switch.Element {
    constructor() {
      super(routes as any);
    }
  }
});
