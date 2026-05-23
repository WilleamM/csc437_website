import { html, css, shadow } from "@unbndl/html";
import { createViewModel } from "@unbndl/view";
import { fromAuth } from "@unbndl/auth";
import reset from "./styles/reset.css.js";

export class WorkoutHeaderElement extends HTMLElement {
  viewModel = createViewModel({
    authenticated: false,
    username: undefined
  }).with(fromAuth(this), "authenticated", "username");

  view = html`
    <header>
      <a href="/index.html" class="app-name">Workout Tracker</a>
      <nav class=${($) => $.authenticated ? "logged-in" : "logged-out"}>
        <menu>
          <li class="when-signed-in">
            <span>Hi, ${($) => $.username || ""}!</span>
          </li>
          <li class="when-signed-in">
            <button>Sign Out</button>
          </li>
          <li class="when-signed-out">
            <a href="/login.html">Sign In</a>
          </li>
        </menu>
      </nav>
    </header>
  `;

  constructor() {
    super();
    shadow(this)
      .styles(reset.styles, WorkoutHeaderElement.styles)
      .replace(this.viewModel.render(this.view))
      .delegate(".when-signed-in button", {
        click: () => this.signout()
      });
  }

  signout() {
    const customEvent = new CustomEvent("auth:message", {
      bubbles: true,
      composed: true,
      detail: ["auth/signout"]
    });
    this.dispatchEvent(customEvent);
    window.location.replace("/login.html");
  }

  static styles = css`
    header {
      background-color: var(--color-background-header);
      color: var(--color-text-header);
      padding: var(--space-md) var(--space-lg);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .app-name {
      color: var(--color-text-header);
      font-family: var(--font-display);
      font-size: 1.25rem;
      text-decoration: none;
    }

    menu {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      list-style: none;
      padding: 0;
      margin: 0;
    }

    li {
      display: none;
    }

    .logged-in .when-signed-in,
    .logged-out .when-signed-out {
      display: block;
    }

    a {
      color: var(--color-text-header);
    }

    span {
      color: var(--color-text-header);
      font-size: 0.9rem;
    }

    button {
      background: none;
      border: 1px solid var(--color-text-header);
      color: var(--color-text-header);
      padding: 4px var(--space-sm);
      cursor: pointer;
      font-family: var(--font-body);
      font-size: 0.9rem;
    }

    button:hover {
      background-color: rgba(255,255,255,0.1);
    }
  `;
}