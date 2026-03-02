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
  parsedData: jsonb("parsed_data").notNull(), // Structured CSV data as JSON
  fileName: text("file_name").notNull(),
  fileHash: text("file_hash").notNull(), // SHA-256 hash for verification
  fileSize: integer("file_size").notNull(), // Size in bytes
  uploadLocked: boolean("upload_locked").default(true).notNull(), // Permanent lock
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  anomalyScore: integer("anomaly_score").default(0).notNull(), // 0-100 suspicion score
});

// Relations
export const suppliersRelations = relations(suppliers, ({ many }) => ({
  csvUploads: many(csvUploads),
}));

export const investorsRelations = relations(investors, ({ many }) => ({
  csvUploads: many(csvUploads),
}));

export const csvUploadsRelations = relations(csvUploads, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [csvUploads.supplierId],
    references: [suppliers.id],
  }),
  investor: one(investors, {
    fields: [csvUploads.investorId],
    references: [investors.id],
  }),
}));
