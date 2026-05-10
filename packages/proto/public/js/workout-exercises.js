import { html, css, shadow } from "@unbndl/html";

function renderExercise(exercise) {
  const { name, href, muscles, equipment } = exercise;
  return html`
    <workout-exercise
      href=${href}
      muscles=${muscles}
      equipment=${equipment}
    >
      ${name}
    </workout-exercise>
  `;
}

export class WorkoutExercisesElement extends HTMLElement {
  constructor() {
    super();
    shadow(this).styles(WorkoutExercisesElement.styles);
  }

  static observedAttributes = ["src"];

  attributeChangedCallback(name, _, newValue) {
    if (name === "src") {
      this.hydrate(newValue).then((data) => {
        const view = WorkoutExercisesElement.render(data);
        shadow(this).replace(view);
      });
    }
  }

  static render(data) {
    const exercises = data || [];
    return html`
      <ul class="exercise-list">
        ${exercises.map(renderExercise)}
      </ul>
    `;
  }

  hydrate(src) {
    return fetch(src)
      .then((response) => {
        if (response.status !== 200)
          throw `HTTP Status ${response.status}`;
        else return response.json();
      })
      .catch((error) => {
        console.log(`Could not fetch ${src}:`, error);
      });
  }

  static styles = css`
    ul {
      list-style: none;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }
  `;
}
