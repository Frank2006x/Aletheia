import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Suppliers table
export const suppliers = pgTable("suppliers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Investors table
export const investors = pgTable("investors", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// CSV uploads table - one-time locked uploads
export const csvUploads = pgTable("csv_uploads", {
  id: uuid("id").defaultRandom().primaryKey(),
  supplierId: uuid("supplier_id")
    .references(() => suppliers.id)
    .notNull(),
  investorId: uuid("investor_id")
    .references(() => investors.id)
    .notNull(),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  fileHash: text("file_hash").notNull(), // SHA-256 hash for verification
  fileSize: integer("file_size").notNull(), // Size in bytes
  uploadLocked: boolean("upload_locked").default(true).notNull(), // Permanent lock
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  anomalyScore: integer("anomaly_score").default(0).notNull(), // 0-100 suspicion score
});

// Chat threads table - conversational context
export const chatThreads = pgTable("chat_threads", {
  id: uuid("id").primaryKey(), // Client-generated UUID
  csvUploadId: uuid("csv_upload_id")
    .references(() => csvUploads.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Chat messages table - full conversation history
export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  threadId: uuid("thread_id")
    .references(() => chatThreads.id)
    .notNull(),
  role: text("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  chartConfig: jsonb("chart_config"), // Chart.js config if generated
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const suppliersRelations = relations(suppliers, ({ many }) => ({
  csvUploads: many(csvUploads),
}));

export const investorsRelations = relations(investors, ({ many }) => ({
  csvUploads: many(csvUploads),
}));

export const csvUploadsRelations = relations(csvUploads, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [csvUploads.supplierId],
    references: [suppliers.id],
  }),
  investor: one(investors, {
    fields: [csvUploads.investorId],
    references: [investors.id],
  }),
  chatThreads: many(chatThreads),
}));

export const chatThreadsRelations = relations(chatThreads, ({ one, many }) => ({
  csvUpload: one(csvUploads, {
    fields: [chatThreads.csvUploadId],
    references: [csvUploads.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  thread: one(chatThreads, {
    fields: [chatMessages.threadId],
    references: [chatThreads.id],
  }),
}));
