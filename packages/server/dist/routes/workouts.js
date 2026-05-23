import express from "express";
import Workouts from "../services/workout-service.js";
const router = express.Router();
router.get("/", (_, res) => {
    Workouts.index()
        .then((list) => res.send(list))
        .catch((err) => res.status(500).send(err));
});
router.get("/:id", (req, res) => {
    const { id } = req.params;
    Workouts.get(id)
        .then((workout) => {
        if (!workout)
            res.status(404).send();
        else
            res.send(workout);
    })
        .catch((err) => res.status(404).send(err));
});
router.post("/", (req, res) => {
    const newWorkout = req.body;
    Workouts.create(newWorkout)
        .then((workout) => res.status(201).json(workout))
        .catch((err) => res.status(500).send(err));
});
router.put("/:id", (req, res) => {
    const { id } = req.params;
    const updatedWorkout = req.body;
    Workouts.update(id, updatedWorkout)
        .then((workout) => res.json(workout))
        .catch((err) => res.status(404).send(err));
});
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    Workouts.remove(id)
        .then(() => res.status(204).end())
        .catch((err) => res.status(404).send(err));
});
export default router;
