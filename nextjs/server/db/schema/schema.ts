import {
  mysqlTable,
  varchar,
  text,
  bigint,
  timestamp,
  int,
} from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";

export const projectsTable = mysqlTable("projects", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(), // Use VARCHAR(36) for UUID
  title: text("title").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull().defaultNow().onUpdateNow(),
  userId: varchar("user_id", { length: 50 }).notNull(),
});

// ✅ Explicitly export schema as a single object

export const assetTable = mysqlTable("assets", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .notNull()
    .default(sql`(UUID())`), // ✅ MySQL will generate a UUID automatically
  projectId: varchar("project_id", { length: 36 })
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  size: bigint("size", { mode: "number" }).notNull(),
  content: text("content").default(""),
  tokenCount: int("token_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().onUpdateNow(),
});


// ✅ Asset Processing Jobs Table (MySQL Conversion)
export const assetProcessingJobTable = mysqlTable("asset_processing_jobs", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .notNull()
    .default(sql`(UUID())`),
  assetId: varchar("asset_id", { length: 36 })
    .notNull()
    .unique()
    .references(() => assetTable.id, { onDelete: "cascade" }),
  projectId: varchar("project_id", { length: 36 })
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  errorMessage: text("error_message"),
  attempts: int("attempts").notNull().default(0),
  lastHeartBeat: timestamp("last_heart_beat").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().onUpdateNow(),
});

// ✅ Relations (MySQL Version)
export const projectsRelations = relations(projectsTable, ({ many }) => ({
  assets: many(assetTable),
}));

export const assetRelations = relations(assetTable, ({ one }) => ({
  project: one(projectsTable, {
    fields: [assetTable.projectId],
    references: [projectsTable.id],
  }),
}));

export const assetProcessingJobRelations = relations(
  assetProcessingJobTable,
  ({ one }) => ({
    asset: one(assetTable, {
      fields: [assetProcessingJobTable.assetId],
      references: [assetTable.id],
    }),
    project: one(projectsTable, {
      fields: [assetProcessingJobTable.projectId],
      references: [projectsTable.id],
    }),
  })
);

// Types
export type InsertProject = typeof projectsTable.$inferInsert;
export type Project = typeof projectsTable.$inferSelect;
export type Asset = typeof assetTable.$inferSelect;
export type InsertAsset = typeof assetTable.$inferInsert;
export type AssetProcessingJob = typeof assetProcessingJobTable.$inferSelect;
export type InsertAssetProcessingJob =
  typeof assetProcessingJobTable.$inferInsert;
