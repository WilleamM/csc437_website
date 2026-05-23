import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import credentials from "../services/credential-svc.js";
dotenv.config();
const router = express.Router();
const TOKEN_SECRET = process.env.TOKEN_SECRET || "NOT_A_SECRET";
router.post("/register", (req, res) => {
    const { username, password, name } = req.body;
    if (typeof username !== "string" || typeof password !== "string" || typeof name !== "string") {
        res.status(400).send("Bad request: Invalid input data.");
    }
    else {
        credentials
            .create(username, password, name)
            .then((creds) => generateAccessToken(creds.username, creds.name))
            .then((token) => {
            res.status(201).send({ token: token });
        })
            .catch((err) => {
            res.status(409).send({ error: err });
        });
    }
});
router.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).send("Bad request: Invalid input data.");
    }
    else {
        credentials
            .verify(username, password)
            .then((goodUser) => generateAccessToken(goodUser))
            .then((token) => res.status(200).send({ token: token }))
            .catch(() => res.status(401).send("Unauthorized"));
    }
});
function generateAccessToken(username, name = "") {
    return new Promise((resolve, reject) => {
        jwt.sign({ username, name }, TOKEN_SECRET, { expiresIn: "1d" }, (error, token) => {
            if (error)
                reject(error);
            else
                resolve(token);
        });
    });
}
export function authenticateUser(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        res.status(401).end();
    }
    else {
        jwt.verify(token, TOKEN_SECRET, (error, decoded) => {
            if (decoded)
                next();
            else
                res.status(401).end();
        });
    }
}
export default router;
