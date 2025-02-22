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
    .notNull(), // ✅ MySQL will generate a UUID automatically
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

export const promptsTable = mysqlTable("prompts", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .notNull()
    .default(sql`(UUID())`),
  projectId: varchar("project_id", { length: 36 })
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  prompt: text("prompt").notNull(),
  tokenCount: int("token_count").notNull().default(0),
  order: int("order").notNull().default(0),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
    .notNull(),
});

export const templatesTable = mysqlTable("templates", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .notNull()
    .default(sql`(UUID())`),
   userId: varchar("user_id", { length: 50 }).notNull(),
   title: text("title").notNull(),
   createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
   updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull().defaultNow().onUpdateNow(),
});

export const templatePromptsTable = mysqlTable("template_prompts", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .notNull()
    .default(sql`(UUID())`),
  templateId: varchar("template_id", { length: 36 })
    .notNull()
    .references(() => templatesTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  prompt: text("prompt").notNull(),
  tokenCount: int("token_count").notNull().default(0),
  order: int("order").notNull().default(0),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull().defaultNow().onUpdateNow(),
});


export const generatedContentTable = mysqlTable("generated_content", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  projectId: varchar("project_id", { length: 36 })
    .notNull()
    .references(() => projectsTable.id, {
      onDelete: "cascade",
    }),
  name: text("name").notNull(),
  result: text("result").notNull(),
  order: int("order").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .onUpdateNow(),
});

export const stripeCustomersTable = mysqlTable("stripe_customers", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 50 }).notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 50 }).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const subscriptionsTable = mysqlTable("subscriptions", {
  id: varchar("id", { length: 50 }).primaryKey().default(sql`(UUID())`),  
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 100 })
    .notNull()
    .unique(),
  userId: varchar("user_id", { length: 50 }).notNull(),
})

export const GeneratedContentRelations = relations(generatedContentTable, ({ one }) => ({
  project: one(projectsTable, {
    fields: [generatedContentTable.projectId],
    references: [projectsTable.id],
  }),
}));


export const templatePromptRelations = relations(templatePromptsTable, ({ one }) => ({
  template: one(templatesTable, {
    fields: [templatePromptsTable.templateId],
    references: [templatesTable.id],
  }),
}));


export const templateRelations = relations(templatesTable, ({ many }) => ({
  templatePrompts: many(templatePromptsTable),
}));

export const promptRelations = relations(promptsTable, ({ one }) => ({
  project: one(projectsTable, {
    fields: [promptsTable.projectId],
    references: [projectsTable.id],
  }),
}));

// ✅ Relations (MySQL Version)
export const projectsRelations = relations(projectsTable, ({ many }) => ({
  assets: many(assetTable),
  prompts: many(promptsTable),
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
export type InsertAssetProcessingJob = typeof assetProcessingJobTable.$inferInsert;
export type Prompt = typeof promptsTable.$inferSelect;
export type InsertPrompt = typeof promptsTable.$inferInsert;
export type Template = typeof templatesTable.$inferSelect;
export type InsertTemplate = typeof templatesTable.$inferInsert;
export type TemplatePrompt = typeof templatePromptsTable.$inferSelect;
export type InsertTemplatePrompt = typeof templatePromptsTable.$inferInsert;
export type GeneratedContent = typeof generatedContentTable.$inferSelect;
export type InsertGeneratedContent = typeof generatedContentTable.$inferInsert;
export type StripeCustomer = typeof stripeCustomersTable.$inferSelect;
export type InsertStripeCustomer = typeof stripeCustomersTable.$inferInsert;
export type Subscription = typeof subscriptionsTable.$inferSelect;
export type InsertSubscription = typeof subscriptionsTable.$inferInsert;