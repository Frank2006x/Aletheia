# Neon Database Setup Guide

This project uses **Neon Serverless PostgreSQL** with **Drizzle ORM** for database operations.

## 📁 Database Architecture

```
Neon PostgreSQL (Serverless)
├── suppliers (supplier accounts)
├── investors (investor accounts)
├── pdf_uploads (PDF files metadata + SHA-256 hash)
├── chat_threads (conversation threads per PDF)
└── chat_messages (full message history)
```

## 🚀 Quick Start

### 1. Environment Setup

Your `.env.local` should contain:

```env
DATABASE_URL="postgresql://user:password@host.region.aws.neon.tech/database?sslmode=require"
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Push Schema to Database

```bash
pnpm db:push
```

This command:
- Reads `core/db/schema.ts`
- Creates all tables in your Neon database
- No migration files generated (uses Drizzle's push mode)

### 4. Seed Database (Optional)

```bash
pnpm db:seed
```

This creates:
- 1 demo supplier
- 1 demo investor

**Copy the UUIDs returned** - you'll need them for testing uploads.

## 📊 Database Schema

### `suppliers` table
```sql
id          UUID PRIMARY KEY (auto-generated)
name        TEXT NOT NULL
email       TEXT UNIQUE NOT NULL
created_at  TIMESTAMP DEFAULT NOW()
```

### `investors` table
```sql
id          UUID PRIMARY KEY (auto-generated)
name        TEXT NOT NULL
email       TEXT UNIQUE NOT NULL
created_at  TIMESTAMP DEFAULT NOW()
```

### `pdf_uploads` table
```sql
id             UUID PRIMARY KEY (auto-generated)
supplier_id    UUID → suppliers(id)
investor_id    UUID → investors(id)
file_url       TEXT (Vercel Blob URL)
file_name      TEXT
file_hash      TEXT (SHA-256 for verification)
file_size      INTEGER (bytes)
upload_locked  BOOLEAN DEFAULT true (permanent lock)
uploaded_at    TIMESTAMP DEFAULT NOW()
anomaly_score  INTEGER DEFAULT 0 (0-100 suspicion score)
```

### `chat_threads` table
```sql
id             UUID PRIMARY KEY (client-provided)
pdf_upload_id  UUID → pdf_uploads(id)
created_at     TIMESTAMP DEFAULT NOW()
```

### `chat_messages` table
```sql
id             UUID PRIMARY KEY (auto-generated)
thread_id      UUID → chat_threads(id)
role           TEXT ('user' | 'assistant')
content        TEXT (message content)
chart_config   JSONB (Chart.js config if chart generated)
created_at     TIMESTAMP DEFAULT NOW()
```

## 🛠 Available Scripts

### `pnpm db:push`
Push schema changes to Neon database (no migrations)

### `pnpm db:generate`
Generate migration files from schema (if using migrations mode)

### `pnpm db:studio`
Open Drizzle Studio - visual database browser at `https://local.drizzle.studio`

### `pnpm db:seed`
Run seed script to populate demo data

## 📝 Usage in Code

### Import Database Client

```typescript
import { db } from '@/core/db';
import { pdfUploads, suppliers, investors } from '@/core/db/schema';
```

### Insert Data

```typescript
const [upload] = await db.insert(pdfUploads).values({
  supplierId: '...',
  investorId: '...',
  fileUrl: 'https://...',
  fileName: 'report.pdf',
  fileHash: 'sha256...',
  fileSize: 1024000,
}).returning();
```

### Query Data

```typescript
import { eq } from 'drizzle-orm';

const uploads = await db
  .select()
  .from(pdfUploads)
  .where(eq(pdfUploads.supplierId, supplierUuid));
```

### Join Queries

```typescript
const uploadsWithRelations = await db.query.pdfUploads.findMany({
  with: {
    supplier: true,
    investor: true,
    chatThreads: {
      with: {
        messages: true,
      },
    },
  },
});
```

## 🔐 Security Features

1. **One-Time Upload Lock**: `upload_locked` = true prevents re-uploads
2. **SHA-256 Hash**: Verifies file integrity
3. **Anomaly Score**: Tracks suspicion level (0-100)
4. **Immutable Timestamps**: All records timestamped
5. **Foreign Key Constraints**: Ensures data integrity

## 🌐 Neon Features Used

- **Serverless**: Auto-scales to zero when idle
- **Branching**: Create database branches for dev/staging
- **Point-in-Time Recovery**: Restore to any point (7 days)
- **Connection Pooling**: Built-in with `-pooler` endpoint

## 📚 Future Enhancements

- [ ] Add blockchain anchoring table for immutable audit trail
- [ ] Implement government monitoring table
- [ ] Add role-based access control tables
- [ ] Create views for anomaly detection queries
- [ ] Add full-text search on PDF content

## 🐛 Troubleshooting

### Error: "DATABASE_URL is not set"

Make sure `.env.local` exists and contains valid `DATABASE_URL`.

### Error: "Connection failed"

1. Check Neon dashboard - is database active?
2. Verify connection string format includes `?sslmode=require`
3. Try regenerating credentials in Neon dashboard

### Schema changes not reflecting

```bash
pnpm db:push
```

This force-syncs schema to database.

## 📖 Resources

- [Neon Documentation](https://neon.tech/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Drizzle with Neon](https://orm.drizzle.team/docs/tutorials/drizzle-with-neon)
