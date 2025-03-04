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
    google_sheet_id: varchar("google_sheet_id", { length: 255 }),
    pages: int("pages").default(5),
    cookies: json("cookies"),
    createdAt: timestamp("created_at")
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp("updated_at")
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    custom_selector: varchar("custom_selector", { length: 255 }),
    paginationMethod: varchar("pagination_method", { length: 255 }),
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
    storage: varchar("storage", { length: 255 }).default('0mb'), // Nullable    
    google_drive_folder_id: varchar("google_drive_folder_id", { length: 255 }),
});
export const scrapedRequestsTable = mysqlTable("scraped_requests", {
    id: varchar("id", { length: 36 })
        .primaryKey()
        .notNull()
        .default(sql`(UUID())`),
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => usersTable.id, { onDelete: "cascade" }),
    url: varchar("url", { length: 255 }).notNull(), // Website the user scraped
    urls: json("urls").notNull(), // Multiple URLs for Scrape, Single for Crawl
    tag: varchar("tag", { length: 255 }).notNull(), // The HTML tag used for scraping
    fields: json("fields").notNull(), // The fields to scrape
    cookies: json("cookies"), // Cookies to use for scraping
    customSelector: varchar("custom_selector", { length: 255 }), // Custom CSS selector
    google_sheet_id: varchar("google_sheet_id", { length: 255 }), // Google Sheet ID
    selectors: json("selectors").notNull(), // The CSS selectors used for scraping
    name: varchar("name", { length: 255 }).notNull(), // User-defined name for request
    status: varchar("status", { length: 255 }).default("pending").notNull(), // Status of the scraping task
    createdAt: timestamp("created_at")
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    updatedAt: timestamp("updated_at")
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
    completedAt: timestamp("completed_at"),
    errorMessage: varchar("error_message", { length: 255 }),
});
export const scrapedResultsTable = mysqlTable("scraped_results", {
    id: varchar("id", { length: 36 })
        .primaryKey()
        .notNull()
        .default(sql`(UUID())`),
    jobId: varchar("job_id", { length: 36 })
        .notNull()
        .references(() => scrapedRequestsTable.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => usersTable.id, { onDelete: "cascade" }),
    data: json("data").notNull(), // Stores the extracted data
    createdAt: timestamp("created_at")
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),
});



export const scrapedRequestRelations = relations(scrapedRequestsTable, ({ many }) => ({
    results: many(scrapedResultsTable),
}));

export const scrapedResultRelations = relations(scrapedResultsTable, ({ one }) => ({
    request: one(scrapedRequestsTable),
}));


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
export type InsertScrapedRequest = typeof scrapedRequestsTable.$inferInsert
export type ScrapedRequest = typeof scrapedRequestsTable.$inferSelect

export type InsertScrapedResult = typeof scrapedResultsTable.$inferInsert
export type ScrapedResult = typeof scrapedResultsTable.$inferSelect

