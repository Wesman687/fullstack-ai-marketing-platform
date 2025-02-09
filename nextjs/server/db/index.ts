import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { DGO_DATABASE, DGO_HOST, DGO_PASSWORD, DGO_PORT, DGO_USER } from "@/lib/config";
import * as schema from "./schema/schema";

async function connectDB() {
  console.log("Connecting to database...");
    
  const connection = await mysql.createConnection({
    host: DGO_HOST,
    user: DGO_USER,
    password: DGO_PASSWORD,
    database: DGO_DATABASE,
    port: Number(DGO_PORT), // Ensure port is a number
  });

  return connection;
}

// ✅ Establish a single shared database instance
const dbPromise = connectDB().then((connection) => drizzle(connection, { schema, mode: "default" }));

// ✅ Export `db` as an async function
export async function db() {
  return dbPromise;
}
