import express, { Request, Response } from "express";
import Workouts from "./services/workout-service.ts";
import { connect } from "./services/mongo.ts";
import workouts from "./routes/workouts.ts";
import auth from "./routes/auth.ts";
import { authenticateUser } from "./routes/auth.ts";



const app = express();
const port = process.env.PORT || 3000;
const staticDir = process.env.STATIC || "public";

app.use(express.static(staticDir));
app.use(express.json());
app.use("/auth", auth);
app.use("/api/workouts", authenticateUser, workouts);

connect("workout-tracker");


app.use("/api/workouts", workouts);


app.get("/hello", (req: Request, res: Response) => {
  res.send("Hello, World");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

