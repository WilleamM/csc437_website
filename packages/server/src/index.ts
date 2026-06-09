import express, { Request, Response } from "express";
import fs from "node:fs/promises";
import path from "path";
import { connect } from "./services/mongo.ts";
import workouts from "./routes/workouts.ts";
import exercises from "./routes/exercises.ts";
import auth from "./routes/auth.ts";
import { authenticateUser } from "./routes/auth.ts";

const app = express();
const port = process.env.PORT || 3000;
const staticDir = process.env.STATIC || "public";

app.use(express.static(staticDir));
app.use(express.json());
app.use("/auth", auth);
app.use("/api/workouts", authenticateUser, workouts);
app.use("/api/exercises", authenticateUser, exercises);

connect("workout-tracker");

app.use("/app", (req: Request, res: Response) => {
  const indexHtml = path.resolve(staticDir, "index.html");
  fs.readFile(indexHtml, { encoding: "utf8" }).then((html) =>
    res.send(html)
  );
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

