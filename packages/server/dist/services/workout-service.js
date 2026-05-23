import { Schema, model } from "mongoose";
const exerciseSchema = new Schema({
    name: String,
    href: String,
    muscles: String,
    equipment: String
});
const workoutSchema = new Schema({
    id: String,
    name: String,
    date: String,
    duration: Number,
    plan: String,
    exercises: [exerciseSchema]
}, { collection: "workouts" });
const WorkoutModel = model("Workout", workoutSchema);
function index() {
    return WorkoutModel.find();
}
function get(id) {
    return WorkoutModel.find({ id })
        .then((list) => list[0])
        .catch((err) => {
        throw `${id} Not Found`;
    });
}
function create(json) {
    const w = new WorkoutModel(json);
    return w.save();
}
function update(id, workout) {
    return WorkoutModel.findOneAndUpdate({ id }, workout, {
        new: true
    }).then((updated) => {
        if (!updated)
            throw `${id} not updated`;
        else
            return updated;
    });
}
function remove(id) {
    return WorkoutModel.findOneAndDelete({ id }).then((deleted) => {
        if (!deleted)
            throw `${id} not deleted`;
    });
}
export default { index, get, create, update, remove };
