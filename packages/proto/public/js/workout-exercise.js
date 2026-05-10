import { html, css, shadow } from "@unbndl/html";
import reset from "./styles/reset.css.js";

export class WorkoutExerciseElement extends HTMLElement {
  static template = html`
    <template>
      <li>
        <a id="exercise-link"><slot>Exercise</slot></a>
        <p id="exercise-muscles"></p>
        <p id="exercise-equipment"></p>
      </li>
    </template>
  `;

  constructor() {
    super();
    shadow(this)
      .template(WorkoutExerciseElement.template)
      .styles(reset.styles, WorkoutExerciseElement.styles);
  }

  static observedAttributes = ["href", "muscles", "equipment"];

  attributeChangedCallback(name, _, newValue) {
    switch (name) {
      case "href":
        this.shadowRoot.getElementById("exercise-link").href = newValue;
        break;
      case "muscles":
        this.shadowRoot.getElementById("exercise-muscles").textContent =
          "Muscles: " + newValue;
        break;
      case "equipment":
        this.shadowRoot.getElementById("exercise-equipment").textContent =
          "Equipment: " + newValue;
        break;
    }
  }

  static styles = css`
    li {
      background-color: var(--color-background-box);
      border: 1px solid var(--color-border);
      padding: var(--space-md);
      display: flex;
      flex-direction: column;
      gap: 4px;
      list-style: none;
    }
    a {
      font-weight: bold;
      font-size: 1.1rem;
      color: var(--color-link);
    }
    p {
      font-size: 0.9rem;
      color: var(--color-text);
    }
  `;
}
