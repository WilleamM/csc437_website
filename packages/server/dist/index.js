import express from "express";
import { connect } from "./services/mongo.js";
import workouts from "./routes/workouts.js";
import auth from "./routes/auth.js";
import { authenticateUser } from "./routes/auth.js";
const app = express();
const port = process.env.PORT || 3000;
const staticDir = process.env.STATIC || "public";
app.use(express.static(staticDir));
app.use(express.json());
app.use("/auth", auth);
app.use("/api/workouts", authenticateUser, workouts);
connect("workout-tracker");
app.use("/api/workouts", workouts);
app.get("/hello", (req, res) => {
    res.send("Hello, World");
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
