import { Router, Request, Response } from "express";
import WorkoutService from "../services/workout-service.ts";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  WorkoutService.index()
    .then((workouts) => {
      const seen = new Set<string>();
      const exercises = workouts
        .flatMap((w: any) => w.exercises || [])
        .filter((ex: any) => {
          if (seen.has(ex.name)) return false;
          seen.add(ex.name);
          return true;
        })
        .map((ex: any) => ({
          name: ex.name,
          href: ex.href || "",
          muscles: ex.muscles || "",
          equipment: ex.equipment || ""
        }));
      res.json(exercises);
    })
    .catch((err) => res.status(500).json({ error: String(err) }));
});

export default router;
