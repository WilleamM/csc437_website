import { html, css, shadow } from "@unbndl/html";
import { createViewModel } from "@unbndl/view";
import { Store, fromStore } from "@unbndl/store";
import { Workout } from "server/models";
import { Model } from "../model.ts";
import { Msg } from "../messages.ts";
import reset from "../styles/reset.css.ts";

type HomeMode = "list" | "new";

export class HomeViewElement extends HTMLElement {
  viewModel = createViewModel({
    workouts: undefined as Workout[] | undefined,
    mode: "list" as HomeMode
  }).with(fromStore<Model>(this), "workouts");

  view = html`
    <main>
      <div class="header-row">
        <h2>My Workouts ${($: any) => $.workouts ? `(${$.workouts.length})` : ""}</h2>
        ${($: any) => $.mode === "list"
          ? html`<button class="new-btn" type="button">+ New Workout</button>`
          : ""}
      </div>
      ${($: any) => $.mode === "new" ? html`
        <form class="create-form">
          <label>Name <input name="name" required /></label>
          <label>Date <input name="date" type="date" /></label>
          <label>Duration (minutes) <input name="duration" type="number" /></label>
          <label>Plan <input name="plan" /></label>
          <div class="form-actions">
            <button type="submit">Create</button>
            <button type="button" class="cancel-btn">Cancel</button>
          </div>
        </form>
      ` : ""}
      <ul class="workout-list">
        ${($: any) => ($.workouts || []).map((w: any) => html`
          <li>
            <a href=${"/app/workout/" + w.id}>${w.name}</a>
            ${w.updatedAt
              ? html`<span class="updated">Last edited: ${formatDate(w.updatedAt)}</span>`
              : ""}
          </li>
        `)}
      </ul>
    </main>
  `;

  constructor() {
    super();
    shadow(this)
      .styles(reset, HomeViewElement.styles)
      .replace(this.viewModel.render(this.view))
      .listen({
        submit: (ev: Event) => this.submitCreate(ev),
        click: (ev: Event) => {
          const target = ev.target as HTMLElement;
          if (target.classList.contains("new-btn"))
            this.viewModel.set("mode", "new");
          if (target.classList.contains("cancel-btn"))
            this.viewModel.set("mode", "list");
        }
      });
  }

  connectedCallback() {
    Store.dispatch(this, ["workouts/request", {}] as Msg);
  }

  submitCreate(ev: Event) {
    ev.preventDefault();
    const form = ev.target as HTMLFormElement;
    const inputs = Array.from(form.elements).filter(
      (el) => "name" in el
    ) as Array<HTMLInputElement>;
    const data = Object.fromEntries(inputs.map((el) => [el.name, el.value])) as any;

    this.dispatch([
      "workout/create",
      {
        workout: {
          id: `workout-${Date.now()}`,
          name: data.name || "New Workout",
          date: data.date || "",
          duration: Number(data.duration) || 0,
          plan: data.plan || "",
          exercises: []
        }
      },
      {
        onSuccess: () => {
          this.viewModel.set("mode", "list");
          form.reset();
        },
        onFailure: (error: Error) => console.log("ERROR:", error)
      }
    ]);
  }

  dispatch(msg: Msg) {
    Store.dispatch(this, msg);
  }

  static styles = css`
    main {
      max-width: 800px;
      margin: 0 auto;
      padding: var(--space-lg);
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    h2 { color: var(--color-accent); font-family: var(--font-display); }
    .new-btn {
      background-color: var(--color-accent);
      color: white;
      border: none;
      padding: var(--space-sm) var(--space-md);
      font-family: var(--font-body);
      font-size: 0.9rem;
      cursor: pointer;
    }
    .new-btn:hover { opacity: 0.85; }
    .create-form {
      background-color: var(--color-background-box);
      border: 1px solid var(--color-border);
      padding: var(--space-md);
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }
    .create-form label {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-weight: bold;
      color: var(--color-accent);
    }
    .create-form input {
      padding: var(--space-sm);
      border: 1px solid var(--color-border);
      font-family: var(--font-body);
      font-size: 1rem;
      background-color: var(--color-background);
      color: var(--color-text);
    }
    .form-actions { display: flex; gap: var(--space-sm); }
    .form-actions button {
      padding: var(--space-sm) var(--space-md);
      border: none;
      font-family: var(--font-body);
      font-size: 1rem;
      cursor: pointer;
    }
    .form-actions button[type="submit"] { background-color: var(--color-accent); color: white; }
    .form-actions button[type="submit"]:hover { opacity: 0.85; }
    .cancel-btn {
      background-color: var(--color-background-box);
      color: var(--color-text);
      border: 1px solid var(--color-border) !important;
    }
    ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: var(--space-sm); }
    li {
      background-color: var(--color-background-box);
      border: 1px solid var(--color-border);
      padding: var(--space-md);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    a {
      font-weight: bold;
      font-size: 1.1rem;
      color: var(--color-link);
      text-decoration: none;
    }
    a:hover { text-decoration: underline; }
    .updated { font-size: 0.8rem; color: var(--color-text); opacity: 0.7; }
  `;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}
