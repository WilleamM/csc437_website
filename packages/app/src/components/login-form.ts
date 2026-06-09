import { css, html, shadow } from "@unbndl/html";
import { createViewModel, fromInputs } from "@unbndl/view";
import reset from "../styles/reset.css.ts";

export class LoginFormElement extends HTMLElement {
  viewModel = createViewModel({
    name: "",
    username: "",
    password: ""
  }).with(fromInputs(this) as any, "name", "username", "password");

  view = html`<template>
    <form>
      <slot></slot>
      <button type="submit">Submit</button>
    </form>
  </template>`;

  constructor() {
    super();
    shadow(this)
      .styles(reset, LoginFormElement.styles)
      .template(this.view)
      .listen({
        submit: (ev: Event) =>
          this.submitLogin(ev, this.getAttribute("api") || "#")
      });
  }

  submitLogin(event: Event, endpoint: string) {
    event.preventDefault();
    const data = this.viewModel.toObject();
    const method = "POST";
    const headers = { "Content-Type": "application/json" };
    const body = JSON.stringify(data);

    fetch(endpoint, { method, headers, body })
      .then((res) => {
        if (res.status !== 200 && res.status !== 201)
          throw `Form submission failed: Status ${res.status}`;
        return res.json();
      })
      .then((json) => {
        const { token } = json;
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.name) localStorage.setItem("userName", payload.name);
        const customEvent = new CustomEvent("auth:message", {
          bubbles: true,
          composed: true,
          detail: ["auth/signin", { token, redirect: "/app" }]
        });
        this.dispatchEvent(customEvent);
      })
      .catch(() => {
        const errorEl = this.querySelector("#login-error");
        if (errorEl) (errorEl as HTMLElement).style.display = "block";
      });
  }

  static styles = css`
    form { display: flex; flex-direction: column; gap: var(--space-md); }
    ::slotted(label) { display: flex; flex-direction: column; gap: 4px; }
    button {
      background-color: var(--color-accent);
      color: white;
      border: none;
      padding: var(--space-sm) var(--space-md);
      font-family: var(--font-body);
      font-size: 1rem;
      cursor: pointer;
      align-self: flex-start;
    }
    button:hover { opacity: 0.85; }
  `;
}
