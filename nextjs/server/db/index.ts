import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { DGO_DATABASE, DGO_HOST, DGO_PASSWORD, DGO_PORT, DGO_USER } from "@/lib/config";
import * as schema from "./schema/schema";

// ✅ Create a MySQL Connection Pool
const pool = mysql.createPool({
  host: DGO_HOST,
  user: DGO_USER,
  password: DGO_PASSWORD,
  database: DGO_DATABASE,
  port: Number(DGO_PORT), // Ensure port is a number
  waitForConnections: true,  // ✅ Ensures connections wait instead of failing
  connectionLimit: 5,        // ✅ Limit to 5 active connections
});

// ✅ Use a single drizzle instance with a pooled connection
const dbPromise = pool.getConnection().then((connection) => {
  return drizzle(connection, { schema, mode: "default" });
});

// ✅ Export `db` as an async function
export async function db() {
  return dbPromise;
}
