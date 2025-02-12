import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
import * as dotenv from "dotenv";
dotenv.config()

config({path: "./.env.local"});

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is undefined. Make sure it's in .env.local!");
}


export default defineConfig({
  schema: "./server/db/schema/schema.ts",  // Path to your schema file
  dialect: "mysql", // Database dialect
  out: "./drizzle", // Output folder for migrations
  dbCredentials: {
    url: DATABASE_URL,
  },
});