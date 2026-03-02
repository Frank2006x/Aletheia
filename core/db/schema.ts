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
  email: text("email").notNull().unique(),
});

// Upload links — created by investors, consumed once by suppliers
export const uploadLinks = pgTable("upload_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  token: text("token").notNull().unique(), // 48-char hex random token
  investorUserId: text("investor_user_id").notNull(), // references auth user.id
  supplierUserId: text("supplier_user_id"), // filled when supplier uploads
  status: text("status").notNull().default("pending"), // 'pending' | 'used'
  uploadId: uuid("upload_id"), // FK to csvUploads.id (set on use)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// CSV uploads table - one-time locked uploads
export const csvUploads = pgTable("csv_uploads", {
  id: uuid("id").defaultRandom().primaryKey(),
  supplierId: uuid("supplier_id").references(() => suppliers.id),
  investorId: uuid("investor_id").references(() => investors.id),
  investorUserId: text("investor_user_id"), // auth user.id of investor
  supplierUserId: text("supplier_user_id"), // auth user.id of supplier
  linkToken: text("link_token"), // the upload link token used
  parsedData: jsonb("parsed_data").notNull(), // Structured CSV data as JSON
  fileName: text("file_name").notNull(),
  fileHash: text("file_hash").notNull(), // SHA-256 hash for verification
  fileSize: integer("file_size").notNull(), // Size in bytes
  ipfsCid: text("ipfs_cid"), // Lighthouse IPFS CID
  ipfsUrl: text("ipfs_url"), // Public IPFS gateway URL
  analysisResult: jsonb("analysis_result"), // Stored AutoAnalysisResult JSON
  uploadLocked: boolean("upload_locked").default(true).notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  anomalyScore: integer("anomaly_score").default(0).notNull(),
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

export const uploadLinksRelations = relations(uploadLinks, ({ one }) => ({
  upload: one(csvUploads, {
    fields: [uploadLinks.uploadId],
    references: [csvUploads.id],
  }),
}));
