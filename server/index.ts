import express from "express";
import { connectDB } from "./src/db/mongoDB";

const app = express();

app.use(express.json())

connectDB()

app.get("/", (req, res) => {
    res.send("Hello World!");
});

if (Bun.env.NODE_ENV !== "production") {
    app.listen(7000, () => {
        console.log(`Listening on http://localhost:${7000}`);
    });
}

export default app