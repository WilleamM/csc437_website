import { html, css, shadow } from "@unbndl/html";
import { createViewModel, createView, fromAttributes, View } from "@unbndl/view";
import { Store, fromStore } from "@unbndl/store";
import { Workout, Exercise } from "server/models";
import { Model } from "../model.ts";
import { Msg } from "../messages.ts";
import reset from "../styles/reset.css.ts";

type WorkoutMode = "view" | "edit";

interface WorkoutViewModel {
  "workout-id": string;
  workoutId: string;
  mode: WorkoutMode;
  workout?: Workout;
  availableExercises: Exercise[];
  pendingExercises: Exercise[];
}

export class WorkoutViewElement extends HTMLElement {
  viewModel = createViewModel<WorkoutViewModel>({
    "workout-id": "",
    workoutId: "",
    mode: "view" as WorkoutMode,
    workout: undefined as Workout | undefined,
    availableExercises: [] as Exercise[],
    pendingExercises: [] as Exercise[]
  })
    .withRenamed(fromAttributes<{ "workout-id": string }>(this), {
      workoutId: "workout-id"
    })
    .with(fromStore<Model>(this), "workout")
    .withRenamed(fromStore<Model>(this) as any, { availableExercises: "exercises" });

  mainView = createView<Workout>(html`
    <section class="detail-section">
      <dl>
        <dt>Date</dt><dd>${(w: any) => w.date || ""}</dd>
        <dt>Duration</dt><dd>${(w: any) => w.duration ? w.duration + " minutes" : ""}</dd>
        <dt>Plan</dt><dd>${(w: any) => w.plan || ""}</dd>
      </dl>
      <h2>Exercises</h2>
      <ul>
        ${(w: any) => (w.exercises || []).map((ex: any) => html`
          <li>
            <span class="ex-name">${ex.name}</span>
            <p>${ex.muscles} · ${ex.equipment}</p>
            ${ex.sets || ex.reps
              ? html`<p class="sets-reps">${ex.sets ? ex.sets + " sets" : ""} ${ex.sets && ex.reps ? "·" : ""} ${ex.reps ? ex.reps + " reps" : ""}</p>`
              : ""}
          </li>
        `)}
      </ul>
      <button class="edit-btn" type="button">Edit Workout</button>
    </section>
  `);

  editView = createView<Workout>(html`
    <form class="edit-form">
      <label>Name <input name="name" value=${(w: any) => w.name || ""} /></label>
      <label>Date <input name="date" value=${(w: any) => w.date || ""} /></label>
      <label>Duration (minutes) <input name="duration" type="number" value=${(w: any) => w.duration || ""} /></label>
      <label>Plan <input name="plan" value=${(w: any) => w.plan || ""} /></label>
      <h3>Exercises</h3>
      ${(w: any) => (w.exercises || []).map((ex: any, i: number) => html`
        <div class="exercise-edit">
          <span class="ex-name">${ex.name}</span>
          <div class="sets-reps-inputs">
            <label>Sets <input name=${"sets-" + i} type="number" value=${String(ex.sets || "")} /></label>
            <label>Reps <input name=${"reps-" + i} type="number" value=${String(ex.reps || "")} /></label>
          </div>
        </div>
      `)}
      <div class="form-actions">
        <button type="submit">Save</button>
        <button type="button" class="cancel-btn">Cancel</button>
      </div>
    </form>
  `);

  view = html`
    <main>
      <a class="back-link" href="/app">← Back</a>
      <h1>${($: any) => $.workout?.name || "Loading..."}</h1>
      ${($: any) => $.workout
        ? View.apply(
            $.mode === "edit" ? this.editView : this.mainView,
            $.workout
          )
        : ""}
      ${($: any) => $.mode === "edit" ? html`
        <div class="exercise-picker">
          <h3>Add Exercises</h3>
          <div class="picker-row">
            <select class="exercise-select">
              <option value="">— pick an exercise —</option>
              ${($.availableExercises || []).map((ex: any) =>
                html`<option value=${ex.name}>${ex.name} (${ex.muscles})</option>`
              )}
            </select>
            <button type="button" class="add-exercise-btn">Add</button>
          </div>
          ${($.pendingExercises || []).length ? html`
            <ul class="pending-list">
              ${($.pendingExercises || []).map((ex: any) => html`
                <li class="pending-item">
                  ${ex.name}
                  <button type="button" class="remove-pending" data-name=${ex.name}>×</button>
                </li>
              `)}
            </ul>
          ` : ""}
        </div>
      ` : ""}
    </main>
  `;

  constructor() {
    super();
    shadow(this)
      .styles(reset, WorkoutViewElement.styles)
      .replace(this.viewModel.render(this.view))
      .listen({
        submit: (ev: Event) => this.submitForm(ev),
        click: (ev: Event) => {
          const target = ev.target as HTMLElement;
          if (target.classList.contains("edit-btn"))
            this.viewModel.set("mode", "edit");
          if (target.classList.contains("cancel-btn")) {
            this.viewModel.set("mode", "view");
            this.viewModel.set("pendingExercises", []);
          }
          if (target.classList.contains("add-exercise-btn")) {
            const select = this.shadowRoot?.querySelector(
              ".exercise-select"
            ) as HTMLSelectElement;
            if (select?.value) {
              const available = this.viewModel.$.availableExercises || [];
              const ex = available.find((e: any) => e.name === select.value);
              if (ex) {
                const pending = this.viewModel.$.pendingExercises || [];
                if (!pending.find((e: any) => e.name === ex.name)) {
                  this.viewModel.set("pendingExercises", [...pending, ex]);
                }
              }
              select.value = "";
            }
          }
          if (target.classList.contains("remove-pending")) {
            const name = (target as HTMLElement).dataset.name;
            const pending = this.viewModel.$.pendingExercises || [];
            this.viewModel.set(
              "pendingExercises",
              pending.filter((e: any) => e.name !== name)
            );
          }
        }
      });

    this.viewModel.createEffect(($: any) => {
      if ($.workoutId)
        this.dispatch(["workout/request", { id: $.workoutId }]);
    });
  }

  connectedCallback() {
    Store.dispatch(this, ["exercises/request", {}] as Msg);
  }

  submitForm(ev: Event) {
    ev.preventDefault();
    const form = ev.target as HTMLFormElement;
    const id = this.viewModel.$.workoutId;
    const current = this.viewModel.$.workout;

    if (id && current) {
      const formData = this.formDataToJSON(form) as any;
      const pendingExercises = this.viewModel.$.pendingExercises || [];

      const exercises = [
        ...(current.exercises || []).map((ex, i) => ({
          ...ex,
          sets: formData[`sets-${i}`] !== "" ? Number(formData[`sets-${i}`]) : ex.sets,
          reps: formData[`reps-${i}`] !== "" ? Number(formData[`reps-${i}`]) : ex.reps
        })),
        ...pendingExercises
      ];

      const workout: Workout = {
        ...current,
        name: formData.name || current.name,
        date: formData.date || current.date,
        duration: Number(formData.duration) || current.duration,
        plan: formData.plan || current.plan,
        exercises
      };

      this.dispatch([
        "workout/save",
        { id, workout },
        {
          onSuccess: () => {
            this.viewModel.set("mode", "view");
            this.viewModel.set("pendingExercises", []);
          },
          onFailure: (error: Error) => console.log("ERROR:", error)
        }
      ]);
    }
  }

  formDataToJSON(form: HTMLFormElement): object {
    const inputs = Array.from(form.elements).filter(
      (el) => "name" in el
    ) as Array<HTMLInputElement>;

    const entries = inputs.map((el) => [el.name, el.value]);
    return Object.fromEntries(entries);
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
    .back-link { color: var(--color-link); font-size: 0.9rem; }
    h1, h2, h3 {
      color: var(--color-accent);
      font-family: var(--font-display);
    }
    dl {
      background-color: var(--color-background-box);
      border: 1px solid var(--color-border);
      padding: var(--space-md);
    }
    dt { font-weight: bold; color: var(--color-accent); margin-top: var(--space-sm); }
    dt:first-child { margin-top: 0; }
    dd { margin-left: var(--space-md); }
    ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: var(--space-sm); }
    li {
      background-color: var(--color-background-box);
      border: 1px solid var(--color-border);
      padding: var(--space-md);
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .ex-name { font-weight: bold; font-size: 1.1rem; color: var(--color-link); }
    p { font-size: 0.9rem; color: var(--color-text); }
    .sets-reps { font-size: 0.9rem; color: var(--color-accent); font-weight: bold; }
    .edit-btn {
      margin-top: var(--space-sm);
      background-color: var(--color-accent);
      color: white;
      border: none;
      padding: var(--space-sm) var(--space-md);
      font-family: var(--font-body);
      font-size: 1rem;
      cursor: pointer;
      align-self: flex-start;
    }
    .edit-btn:hover { opacity: 0.85; }
    .edit-form {
      background-color: var(--color-background-box);
      border: 1px solid var(--color-border);
      padding: var(--space-md);
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }
    .edit-form label {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-weight: bold;
      color: var(--color-accent);
    }
    .edit-form input {
      padding: var(--space-sm);
      border: 1px solid var(--color-border);
      font-family: var(--font-body);
      font-size: 1rem;
      background-color: var(--color-background);
      color: var(--color-text);
    }
    .exercise-edit {
      background-color: var(--color-background);
      border: 1px solid var(--color-border);
      padding: var(--space-sm) var(--space-md);
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }
    .sets-reps-inputs { display: flex; gap: var(--space-md); }
    .sets-reps-inputs label { flex: 1; }
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
    /* Exercise picker */
    .exercise-picker {
      background-color: var(--color-background-box);
      border: 1px solid var(--color-border);
      padding: var(--space-md);
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }
    .picker-row {
      display: flex;
      gap: var(--space-sm);
      align-items: center;
    }
    .exercise-select {
      flex: 1;
      padding: var(--space-sm);
      border: 1px solid var(--color-border);
      font-family: var(--font-body);
      font-size: 1rem;
      background-color: var(--color-background);
      color: var(--color-text);
    }
    .add-exercise-btn {
      background-color: var(--color-accent);
      color: white;
      border: none;
      padding: var(--space-sm) var(--space-md);
      font-family: var(--font-body);
      font-size: 1rem;
      cursor: pointer;
      white-space: nowrap;
    }
    .add-exercise-btn:hover { opacity: 0.85; }
    .pending-list { padding: 0; }
    .pending-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: var(--color-background);
      border: 1px solid var(--color-border);
      padding: var(--space-sm) var(--space-md);
    }
    .remove-pending {
      background: none;
      border: none;
      color: var(--color-text);
      cursor: pointer;
      font-size: 1.1rem;
      opacity: 0.6;
      padding: 0 var(--space-sm);
    }
    .remove-pending:hover { opacity: 1; }
  `;
}
