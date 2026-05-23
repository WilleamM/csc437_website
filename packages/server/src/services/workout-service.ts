import { Schema, model } from "mongoose";
import { Workout, Exercise } from "../models/index.ts";

const exerciseSchema = new Schema<Exercise>({
  name: String,
  href: String,
  muscles: String,
  equipment: String
});

const workoutSchema = new Schema<Workout>(
  {
    id: String,
    name: String,
    date: String,
    duration: Number,
    plan: String,
    exercises: [exerciseSchema]
  },
  { collection: "workouts" }
);

const WorkoutModel = model<Workout>("Workout", workoutSchema);

function index(): Promise<Workout[]> {
  return WorkoutModel.find();
}

function get(id: string): Promise<Workout | undefined> {
  return WorkoutModel.find({ id })
    .then((list) => list[0])
    .catch((err) => {
      throw `${id} Not Found`;
    });
}

function create(json: Workout): Promise<Workout> {
  const w = new WorkoutModel(json);
  return w.save();
}

function update(
  id: string,
  workout: Workout
): Promise<Workout | undefined> {
  return WorkoutModel.findOneAndUpdate({ id }, workout, {
    new: true
  }).then((updated) => {
    if (!updated) throw `${id} not updated`;
    else return updated as Workout;
  });
}

function remove(id: string): Promise<void> {
  return WorkoutModel.findOneAndDelete({ id }).then((deleted) => {
    if (!deleted) throw `${id} not deleted`;
  });
}

export default { index, get, create, update, remove };