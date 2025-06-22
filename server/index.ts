import express from "express";
import cors from 'cors'
import { connectDB } from "./src/db/mongoDB.js";
import api_routes from "./src/api_routes/routes.js"

// Types
import type { Request, Response } from "express";

// Initialize express
const app = express();

// Middlewares
app.use(cors({
    origin: process.env.FRONTEND_URL
}));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Connect to MongoDB
connectDB()

// Intro API
app.get("/", (req: Request, res: Response) => {
    res.send("Server is running.");
});

// Use routes
app.use('/api', api_routes)

if (process.env.NODE_ENV !== "production") {
    app.listen(7000, () => {
        console.log(`Listening on http://localhost:${7000}`);
    });
}

export default app