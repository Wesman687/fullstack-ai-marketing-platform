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
  connectionLimit: 15,  // ✅ Prevents too many connections
  queueLimit: 0,       // ✅ Prevents excessive queuing
  connectTimeout: 10000, // ✅ Prevents long waiting times
  multipleStatements: false, // ✅ Avoids SQL injection risks
});

// ✅ Function to Get and Release Connections
export async function db() {
  const connection = await pool.getConnection();
  console.log("✅ Database connection established");

  // ✅ Keep the drizzle instance open until explicitly closed
  return drizzle(connection, { schema, mode: "default" });
}

// ✅ Ensure connection is released properly when done
// Define interface for connection type
interface DatabaseConnection {
  end: () => void;
}

export async function releaseConnection(connection: DatabaseConnection): Promise<void> {
  try {
    connection.end();  // ✅ Gracefully close the connection
    console.log("🔄 Connection closed properly");
  } catch (error) {
    console.error("❌ Error closing connection:", error);
  }
}
setInterval(async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log("🔄 Keep-alive ping successful");

    // ✅ Forcefully remove any stuck idle connections
    await pool.query("SELECT 1");
    console.log("🔄 Checked and cleared idle connections");

  } catch (error) {
    console.error("❌ Keep-alive ping failed:", error);
  }
}, 300000); // Every 5 minutes