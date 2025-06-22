import express from "express";
import { connectDB } from "./src/db/mongoDB.js";
import api_routes from "./src/api_routes/routes.js"

// Types
import type { Request, Response } from "express";

const app = express();
app.use(express.json())

app.get("/", (req: Request, res: Response) => {
    res.send("Server is running.");
});

// Connect to MongoDB
connectDB()

// Use routes
app.use('/api', api_routes)

if (process.env.NODE_ENV !== "production") {
    app.listen(7000, () => {
        console.log(`Listening on http://localhost:${7000}`);
    });
}

export default app