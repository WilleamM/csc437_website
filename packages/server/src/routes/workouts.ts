import express, { Request, Response } from "express";
import { Workout } from "../models/index.ts";
import Workouts from "../services/workout-service.ts";

const router = express.Router();

router.get("/", (_, res: Response) => {
  Workouts.index()
    .then((list: Workout[]) => res.send(list))
    .catch((err) => res.status(500).send(err));
});

router.get("/:id", (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  Workouts.get(id)
    .then((workout: Workout | undefined) => {
      if (!workout) res.status(404).send();
      else res.send(workout);
    })
    .catch((err) => res.status(404).send(err));
});

router.post("/", (req: Request, res: Response) => {
  const newWorkout = req.body;

  Workouts.create(newWorkout)
    .then((workout: Workout) => res.status(201).json(workout))
    .catch((err) => res.status(500).send(err));
});

router.put("/:id", (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const updatedWorkout = req.body;

  Workouts.update(id, updatedWorkout)
    .then((workout: Workout | undefined) => res.json(workout))
    .catch((err) => res.status(404).send(err));
});

router.delete("/:id", (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;

  Workouts.remove(id)
    .then(() => res.status(204).end())
    .catch((err) => res.status(404).send(err));
});

export default router;