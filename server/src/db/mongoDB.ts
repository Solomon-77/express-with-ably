import { MongoClient } from "mongodb";
import type { Db } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("Missing MONGODB_URI");

const client = new MongoClient(uri);
let db: Db | null = null;

export async function connectDB() {
    if (db) return db;

    try {
        await client.connect();
        db = client.db();
        console.log("MongoDB connected");
        return db;
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
        db = null
        throw err
    }
}