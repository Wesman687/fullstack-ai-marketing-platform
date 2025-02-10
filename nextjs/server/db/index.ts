import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { DGO_DATABASE, DGO_HOST, DGO_PASSWORD, DGO_PORT, DGO_USER } from "@/lib/config";
import * as schema from "./schema/schema";

// ✅ Create MySQL Connection Pool (Fixed)
const pool = mysql.createPool({
  host: DGO_HOST,
  user: DGO_USER,
  password: DGO_PASSWORD,
  database: DGO_DATABASE,
  port: Number(DGO_PORT),
  waitForConnections: true,
  connectionLimit: 10,  // ✅ Prevents too many connections
  queueLimit: 0,       // ✅ Prevents excessive queuing
  connectTimeout: 10000, // ✅ Prevents long waiting times
  multipleStatements: false, // ✅ Avoids SQL injection risks
});

// ✅ Function to Get and Release Connections
export async function db() {
  let connection;
  try {
    connection = await pool.getConnection(); // ✅ Get connection from pool
    console.log("✅ Database connection established");

    const database = drizzle(connection, { schema, mode: "default" });

    return database;
  } catch (error) {
    console.error("❌ Database connection error:", error);
    throw error;
  } finally {
    if (connection) {
      connection.release(); // ✅ Always release connection back to pool
      console.log("🔄 Connection released back to pool");
    }
  }
}

// ✅ Keep-Alive Ping (Prevents MySQL Timeout)
setInterval(async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping(); // ✅ Keeps MySQL connection alive
    connection.release(); // ✅ Ensure it's returned to the pool
    console.log("🔄 Keep-alive ping successful");
  } catch (error) {
    console.error("❌ Keep-alive ping failed:", error);
  }
}, 300000); // Runs every 5 minutes (300,000 ms)
