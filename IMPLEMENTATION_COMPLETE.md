# Aletheia PDF Analyzer - Complete Setup

Successfully implemented Neon PostgreSQL + Drizzle ORM + LangGraph Agent system.

## ✅ What Was Implemented

### 1. Database Layer (Neon + Drizzle)
- ✅ Database schema with 5 tables (suppliers, investors, pdf_uploads, chat_threads, chat_messages)
- ✅ Drizzle ORM configuration
- ✅ Database connection setup
- ✅ Migration scripts (`db:push`, `db:generate`, `db:studio`)
- ✅ Seed script with demo data

### 2. API Routes
- ✅ `/api/upload` - Upload PDF with supplier/investor IDs, store in Vercel Blob + Neon
- ✅ `/api/chat` - Chat with AI agent, store messages in database

### 3. Components
- ✅ `UploadForm` - Upload PDF with supplier/investor ID inputs
- ✅ `ChatInterface` - Conversational UI with message persistence using `pdfUploadId`
- ✅ `ChartRenderer` - Display Chart.js visualizations
- ✅ Upload page - Complete workflow

### 4. LangGraph Agent
- ✅ Google Gemini integration
- ✅ PDF parsing with LangChain PDFLoader
- ✅ Chart generation tool
- ✅ MemorySaver for conversation context

### 5. Type Safety
- ✅ Updated TypeScript types for database entities
- ✅ Request/response interfaces

## 🗄️ Database Schema

```sql
suppliers (id, name, email, created_at)
investors (id, name, email, created_at)
pdf_uploads (id, supplier_id, investor_id, file_url, file_name, file_hash, file_size, upload_locked, uploaded_at, anomaly_score)
chat_threads (id, pdf_upload_id, created_at)
chat_messages (id, thread_id, role, content, chart_config, created_at)
```

## 🚀 How to Use

### Step 1: Setup Environment

Add to `.env.local`:
```env
GOOGLE_GENERATIVE_AI_API_KEY=your_key
BLOB_READ_WRITE_TOKEN=your_token
DATABASE_URL=postgresql://...
```

### Step 2: Initialize Database

```bash
# Push schema to Neon
pnpm db:push

# Seed demo data
pnpm db:seed
```

**Copy the Supplier ID and Investor ID from seed output!**

### Step 3: Start Development Server

```bash
pnpm dev
```

### Step 4: Test the Flow

1. Navigate to `http://localhost:3000/upload`
2. Paste **Supplier ID** and **Investor ID** from seed script
3. Upload a sustainability PDF
4. Ask questions:
   - "What are the key metrics in this report?"
   - "Create a bar chart showing emissions by year"
5. See chart render inline in chat

## 📁 File Structure

```
core/
├── db/
│   ├── schema.ts          # Drizzle schema definitions
│   ├── index.ts           # Database connection
│   └── seed.ts            # Seed script
├── agent/
│   └── pdf-agent.ts       # LangGraph agent
└── tool/
    ├── pdf-loader.ts      # PDF parsing
    └── chart-generator.ts # Chart tool

app/
├── api/
│   ├── upload/route.ts    # PDF upload + DB insert
│   └── chat/route.ts      # Chat + message persistence
└── upload/page.tsx        # Main upload page

components/
├── UploadForm.tsx         # File + IDs upload form
├── ChatInterface.tsx      # Conversational UI
└── ChartRenderer.tsx      # Chart.js renderer

drizzle.config.ts          # Drizzle Kit config
types/index.ts             # TypeScript types
```

## 🔑 Key Features

### 1. One-Time Upload Lock
PDFs are permanently locked after upload (`upload_locked = true`).

### 2. SHA-256 Verification
File integrity verified with cryptographic hash stored in `file_hash`.

### 3. Conversation Persistence
All chat messages stored in `chat_messages` table with JSON chart configs.

### 4. Relationship Tracking
Database enforces supplier-investor-PDF relationships via foreign keys.

### 5. Anomaly Scoring
`anomaly_score` field (0-100) ready for future malpractice detection.

## 📊 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Next.js dev server |
| `pnpm db:push` | Push schema to Neon database |
| `pnpm db:studio` | Open Drizzle Studio (visual DB browser) |
| `pnpm db:seed` | Seed demo supplier + investor |
| `pnpm db:generate` | Generate migration files |

## 🔄 Data Flow

```
1. User enters Supplier ID + Investor ID + PDF file
   ↓
2. Upload API:
   - Upload PDF to Vercel Blob
   - Calculate SHA-256 hash
   - Insert record to pdf_uploads table
   - Return upload ID
   ↓
3. Chat Interface:
   - Create chat thread (if not exists)
   - Send message to Chat API
   ↓
4. Chat API:
   - Retrieve PDF from database (via upload ID)
   - Load PDF content from Vercel Blob URL
   - Invoke LangGraph agent with PDF context
   - Save user + AI messages to database
   - Return response (+ chart config if generated)
   ↓
5. UI renders message + chart (if present)
```

## 🌟 What's Different from Before

### Before (Vercel Blob only):
- No metadata storage
- No relationship tracking
- No message persistence
- pdfUrl passed around manually

### After (Neon + Drizzle):
- ✅ Full metadata in database
- ✅ Supplier-Investor-PDF relationships
- ✅ Complete chat history stored
- ✅ pdfUploadId references database record
- ✅ SHA-256 verification
- ✅ Anomaly scoring foundation
- ✅ Audit trail ready for blockchain anchoring

## 🔮 Next Steps (Phase 2)

- [ ] Add blockchain anchoring table
- [ ] Implement government monitoring trigger (anomaly_score > 90)
- [ ] Add malpractice detection algorithms
- [ ] Create investor/supplier dashboard
- [ ] Multi-PDF comparison queries
- [ ] Full-text search on PDF content

## 🐛 Troubleshooting

### "DATABASE_URL is not set"
- Ensure `.env.local` exists with valid Neon connection string

### "Supplier/Investor not found"
- Run `pnpm db:seed` to create demo accounts
- Copy the UUIDs from output

### Schema changes not reflecting
- Run `pnpm db:push` to force sync

### Chat agent not responding
- Check `GOOGLE_GENERATIVE_AI_API_KEY` in `.env.local`
- Verify API key has quota remaining

---

## 🎉 Success!

You now have a complete **Neon + Drizzle + LangGraph** implementation with:
- Serverless PostgreSQL database
- Type-safe ORM queries
- AI-powered PDF analysis
- Conversation persistence
- Chart generation
- Foundation for blockchain integration

**Database URL:** Check your Neon dashboard
**Seed Data:** Run `pnpm db:seed` for test UUIDs
**Documentation:** See [DATABASE_SETUP.md](./DATABASE_SETUP.md)
