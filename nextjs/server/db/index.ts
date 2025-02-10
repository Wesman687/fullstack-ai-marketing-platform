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
  waitForConnections: true,
  connectionLimit: 5, // ✅ Prevents too many open connections
  queueLimit: 0,  
  connectTimeout: 10000,
  multipleStatements: true, // ✅ Allows multiple queries per connection
});

// ✅ Use a function to handle database connections
export async function db() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log("✅ Database connection established");
    const database = drizzle(connection, { schema, mode: "default" });
    return database;
  } catch (error) {
    console.error("❌ Database connection error:", error);
    throw error;
  } finally {
    if (connection) {
      connection.release(); // ✅ Always release connection back to the pool
      console.log("🔄 Connection released");
    }
  }
}

// ✅ Keep-Alive Mechanism to Prevent Timeouts
setInterval(async () => {
  try {
    const database = await db();
    await database.execute("SELECT 1"); // ✅ Keeps MySQL connection alive
    console.log("🔄 Keep-alive ping successful");
  } catch (error) {
    console.error("❌ Keep-alive ping failed:", error);
  }
}, 300000); // Runs every 5 minutes
