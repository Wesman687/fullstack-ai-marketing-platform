import { mysqlTable, varchar, timestamp, json, boolean, int } from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";

// Define the crawl_requests table
export const crawlRequestsTable = mysqlTable("crawl_requests", {
    id: varchar("id", { length: 36 })
        .primaryKey()
        .notNull()
        .default(sql`(UUID())`),
    url: varchar("url", { length: 255 }).notNull(),
    userId: varchar("user_id", { length: 255 }).notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    tag: varchar("tag", { length: 255 }).notNull(),
    fields: json("fields").notNull(),
    status: varchar("status", { length: 255 }).default("pending").notNull(),
    createdAt: timestamp("created_at")
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    completedAt: timestamp("completed_at"),
    name: varchar("name", { length: 255 }).notNull(),
    errorMessage: varchar("error_message", { length: 255 }),
});

// Define the crawl_results table
export const crawlResultsTable = mysqlTable("crawl_results", {
    id: varchar("id", { length: 36 })
        .primaryKey()
        .notNull()
        .default(sql`(UUID())`),
    jobId: varchar("job_id", { length: 36 }).notNull().references(() => crawlRequestsTable.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 255 }).notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    data: json("data").notNull(),
    createdAt: timestamp("created_at")
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
});

export const usersTable = mysqlTable("users", {
    id: varchar("id", { length: 36 })
        .primaryKey()
        .notNull()
        .default(sql`(UUID())`),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    email: varchar("email", { length: 255 }), // Nullable
    subscription: boolean("subscription").default(false), // Nullable, default false
    credits: int("credits").default(0), // Nullable, default 0
    storage: varchar("storage", { length: 255 }).default('0mb') // Nullable
});



// Define relations
export const crawlRequestRelations = relations(crawlRequestsTable, ({ many }) => ({
    results: many(crawlResultsTable),
}));

export const crawlResultRelations = relations(crawlResultsTable, ({ one }) => ({
    job: one(crawlRequestsTable),
}));

// Infer the TypeScript types from the schema
export type InsertCrawlRequest = typeof crawlRequestsTable.$inferInsert
export type CrawlRequest = typeof crawlRequestsTable.$inferSelect

export type InsertCrawlResult = typeof crawlResultsTable.$inferInsert
export type CrawlResult = typeof crawlResultsTable.$inferSelect
export type User = typeof usersTable.$inferSelect
export type InsertUser = typeof usersTable.$inferInsert

