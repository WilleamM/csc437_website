import { Workout, Exercise } from "server/models";

export interface Model {
  workout?: Workout;
  workouts?: Workout[];
  exercises?: Exercise[];
}

export const init: Model = {};
