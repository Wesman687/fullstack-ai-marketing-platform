import { mysqlTable, varchar, timestamp, text } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm"; // Import `sql` for default timestamps
import { InferSelectModel } from "drizzle-orm";

export const projectsTable = mysqlTable("projects", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(), // Use VARCHAR(36) for UUID
  title: text("title").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull().defaultNow().onUpdateNow(),
  userId: varchar("user_id", { length: 50 }).notNull(),
});

// ✅ Explicitly export schema as a single object
export type Project = InferSelectModel<typeof projectsTable>;
