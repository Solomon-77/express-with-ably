import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("Missing MONGODB_URI");

const client = new MongoClient(uri);

export async function connectDB() {
    try {
        await client.connect();
        console.log("MongoDB connected");
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
        throw err
    }
}