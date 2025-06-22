import express from "express";
import { connectDB } from "./src/db/mongoDB.js";
import ably_routes from "./src/api_routes/ably_route.js"

const app = express();
app.use(express.json())

app.get("/", (req, res) => {
    res.send("Server is running.");
});

connectDB()

app.use('/ably', ably_routes)

if (process.env.NODE_ENV !== "production") {
    app.listen(7000, () => {
        console.log(`Listening on http://localhost:${7000}`);
    });
}

export default app