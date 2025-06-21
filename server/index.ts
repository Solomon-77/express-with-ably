import express from "express";
import { connectDB } from "./src/db/mongoDB.js";

const app = express();

app.use(express.json())

app.get("/", (req, res) => {
    res.send("Hello World!");
});

connectDB()

if (process.env.NODE_ENV !== "production") {
    app.listen(7000, () => {
        console.log(`Listening on http://localhost:${7000}`);
    });
}

export default app