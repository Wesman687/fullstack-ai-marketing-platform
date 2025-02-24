import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { DGO_DATABASE, DGO_DATABASE2, DGO_HOST, DGO_PASSWORD, DGO_PORT, DGO_USER } from "@/lib/config";
import * as schema from "./schema/schema";
import * as db2schema from "./schema/db2schema";
//database.$client.destroy()

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
  const connection = await pool.getConnection();

  return {
    drizzle: drizzle(connection, { schema, mode: "default" }),
    release: () => {
      connection.release();
    }
  };
}

const poolSecondary = mysql.createPool({
  host: DGO_HOST, // or another host if applicable
  user: DGO_USER, // adjust credentials if necessary
  password: DGO_PASSWORD,
  database: DGO_DATABASE2,
  port: Number(DGO_PORT),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
  multipleStatements: false,
});
export async function dbSecondary() {
  const connection = await poolSecondary.getConnection();
  return {
    drizzle: drizzle(connection, { schema: db2schema, mode: "default" }), // Adjust schema if different
    release: () => connection.release(),
  };
}