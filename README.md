# Aletheia

A verifiable ESG reporting platform that connects investors and suppliers through a token-gated upload system. Suppliers submit sustainability CSV reports which are analyzed by a Gemini-powered AI agent and permanently pinned to IPFS.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Design Decisions](#design-decisions)
- [Getting Started](#getting-started)
- [User Flows](#user-flows)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [AI Analysis Pipeline](#ai-analysis-pipeline)
- [Authentication and Authorization](#authentication-and-authorization)
- [Data Integrity and IPFS](#data-integrity-and-ipfs)
- [Frontend Architecture](#frontend-architecture)
- [Scripts](#scripts)

---

## Overview

Aletheia solves the trust problem in ESG reporting. Investors generate one-time upload links and share them with suppliers. Suppliers upload their sustainability data through that link, triggering automatic AI analysis and immutable on-chain storage. Every report is SHA-256 hashed, pinned to IPFS via Lighthouse, and analyzed against GRI (Global Reporting Initiative) standards.

The core problem this addresses: ESG reports are often self-reported, unverified, and difficult to audit. Aletheia makes reports tamper-evident by hashing each file before storage and permanently anchoring it to IPFS, while the AI layer ensures consistent evaluation against recognized sustainability frameworks.

---

## Tech Stack

| Category        | Technology                                   |
|-----------------|----------------------------------------------|
| Framework       | Next.js 16 (App Router)                      |
| Language        | TypeScript                                   |
| Styling         | Tailwind CSS v4, shadcn/ui                   |
| Authentication  | Better Auth (Google OAuth 2.0)               |
| Database        | Neon (serverless Postgres)                   |
| ORM             | Drizzle ORM                                  |
| AI              | Google Gemini 2.5 Flash via LangChain        |
| IPFS            | Lighthouse Web3 SDK                          |
| State           | Zustand (persisted via localStorage)         |
| Charts          | Chart.js, react-chartjs-2                    |
| Animation       | Framer Motion, GSAP, Lenis                   |

---

## System Architecture

### High-Level Architecture

The system is a monolithic Next.js application that combines the frontend, backend API routes, and AI agent into a single deployable unit. External services (Neon, Google OAuth, Gemini, Lighthouse) are accessed through server-side API routes only — no credentials are exposed to the client.

```
Client (Browser)
     |
     | HTTPS
     v
Next.js App (Vercel / Node)
     |
     |-- /app              React Server and Client Components
     |-- /app/api          Route Handlers (server-side only)
          |
          |-- Better Auth  <-->  Neon (auth tables: user, session, account)
          |-- Drizzle ORM  <-->  Neon (app tables: suppliers, investors, upload_links, csv_uploads)
          |-- LangChain    <-->  Google Gemini 2.5 Flash
          |-- Lighthouse   <-->  IPFS Network
```

### Request Flow — CSV Upload

This is the most complex flow in the system. The following describes what happens when a supplier submits a file:

```
Browser
  |
  |  POST /api/upload/[token]  (multipart/form-data)
  v
Route Handler: app/api/upload/[token]/route.ts
  |
  |  1. Verify session via Better Auth (auth.api.getSession)
  |  2. Validate token exists in upload_links and is status=pending
  |  3. Validate file type (.csv), size (<= 10MB)
  |  4. Compute SHA-256 hash of file buffer
  |  5. Parse CSV text into structured JSON array
  |  6. Insert row into csv_uploads (parsedData, fileName, fileHash, fileSize)
  |  7. Mark upload_links.status = "used", set uploadId FK
  |
  |  Parallel async operations:
  |
  |  [A] Lighthouse SDK
  |       upload(buffer, apiKey)  -->  IPFS Network
  |       <--  { cid, url }
  |       UPDATE csv_uploads SET ipfsCid, ipfsUrl
  |
  |  [B] runAutoAnalysis(csvContext)
  |       ChatGoogleGenerativeAI.withStructuredOutput(ZodSchema)
  |       -->  Google Gemini API
  |       <--  { summary, esgScore, charts, merits, improvements, griCompliance, recommendations }
  |       UPDATE csv_uploads SET analysisResult
  |
  v
Response: { success, upload, autoAnalysis }
```

### Request Flow — AI Chat

```
Browser
  |
  |  POST /api/chat  { message, pdfUploadId, threadId }
  v
Route Handler: app/api/chat/route.ts
  |
  |  1. Verify session
  |  2. Fetch csv_uploads row by pdfUploadId
  |  3. Reconstruct CSV string from parsedData (jsonb)
  |  4. createCsvAgent(csvContext)
  |       --> ChatGoogleGenerativeAI (gemini-2.5-flash, temp 0.7)
  |       --> System prompt injected with full CSV data
  |       --> Tools: generate_chart, analyze_sustainability_report, generate_overview_charts
  |
  |  5. agent.invoke({ messages: [HumanMessage(message)] }, { configurable: { thread_id } })
  |       --> Google Gemini API (multi-turn, tool-calling)
  |       Agent may call tools (ReAct loop):
  |         - generate_chart        --> returns ChartConfig JSON
  |         - analyze_report        --> returns ReportAnalysis JSON
  |
  |  6. Extract final message content + any tool results
  v
Response: { message, chartConfig?, reportAnalysis?, threadId }
```

### Authentication Flow

```
Browser: /sign-in
  |
  |  User selects role (investor | supplier)
  |  User clicks "Continue with Google"
  |
  |  signIn.social({ provider: "google", callbackURL: "/[role]/dashboard?role=[role]" })
  |
  v
Google OAuth Consent Screen
  |
  v
/api/auth/[...all]  (Better Auth handler)
  |
  |  - Exchange OAuth code for tokens
  |  - Upsert user row in `user` table
  |  - Create session, set signed cookie (better-auth.session_token)
  |
  v
Redirect to callbackURL: /investor/dashboard?role=investor
  |
  v
Dashboard page (client)
  |
  |  useEffect reads ?role= param
  |  POST /api/role { role: "investor" }
  |       --> Upsert into investors table (onConflictDoNothing)
  |  router.replace(...) strips ?role= from URL
```

### Middleware — Route Protection

Every request passes through `middleware.ts` before reaching a page or API route. The middleware performs a lightweight check using the session cookie (no database round-trip):

```
Request arrives
  |
  |  pathname.startsWith("/api/")   --> allow (API routes self-authenticate)
  |  sessionCookie present?
  |    YES + pathname = "/sign-in"  --> redirect "/"
  |    NO  + pathname not public    --> redirect "/sign-in?callbackUrl=[pathname]"
  |  otherwise                      --> allow
```

Public routes: `/` (landing page)
Auth routes: `/sign-in`
All other routes require authentication.

---

## Design Decisions

### One-Time Upload Links

Upload links are single-use tokens (48-char hex, 192 bits of entropy). Once a supplier uploads a file, the link status changes to `used` and cannot be submitted again. This is enforced at the API level by checking `status = "pending"` before accepting any upload. This design prevents:

- Suppliers overwriting or contradicting their own submitted data
- Investors being unable to determine the canonical version of a report
- Any mutation of data after the investor has begun analysis

### Immutable Upload Lock

Every `csv_uploads` row is inserted with `uploadLocked = true`. This column exists as a structural signal: no update path in the codebase sets this to false. Combined with the link status check, the system guarantees that once a CSV is submitted it is never replaced or deleted through the application.

### IPFS Pinning for Tamper Evidence

Storing CSVs only in Postgres would make the data mutable by anyone with database access. By pinning to IPFS via Lighthouse:

- The CID (content identifier) is computed from the file content itself. If the file changes, the CID changes. Storing the CID alongside the file is therefore a tamper-detection mechanism.
- The IPFS URL gives investors an external, auditable reference to the exact file submitted.
- Even if the application database were compromised, the IPFS pins remain accessible independently.

### SHA-256 Pre-Hashing

The file is hashed on the server before Lighthouse receives it. This serves a different purpose from the IPFS CID: it allows the hash to be stored in Postgres and compared against a file independently of IPFS availability. Investors or auditors can download the IPFS file, hash it locally, and compare against `fileHash` to verify authenticity.

### Structured Output for Auto-Analysis

Rather than prompting Gemini to return free-form text and parsing it, `runAutoAnalysis()` uses LangChain's `withStructuredOutput()` with a Zod schema. This enforces a guaranteed JSON structure at the model level. The tradeoff is slightly higher latency, but eliminates parsing failures and the need for retry logic when the model returns malformed JSON.

### Role-Based Data Isolation

The `GET /api/links` endpoint determines the caller's role before returning data:

- If the caller's email appears in the `investors` table, it returns links where `investorUserId` matches the session.
- If the caller appears in the `suppliers` table, it returns links where `supplierUserId` matches the session.

This means a supplier cannot see links they were not assigned to, and an investor cannot see other investors' links. The role check is done via a database query because Better Auth's `user` table does not store application-level roles.

### Thread-Based Conversation Context

Each upload session generates a UUID as a `threadId`. This is passed with every chat request and used as the LangChain `thread_id` configurable. The agent retains conversation history within a thread, allowing follow-up questions to reference previous answers within the same analysis session.

### Zustand with localStorage Persistence

After a successful CSV upload on the generic `/upload` page, the upload ID, thread ID, analysis result, and parsed CSV data are stored in Zustand with localStorage persistence. This allows the user to refresh the page without losing the analysis view. The store is reset explicitly via the "Reset" button.

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- pnpm
- A Neon database instance
- Google OAuth credentials (Client ID and Secret)
- Google Generative AI API key
- Lighthouse API key

### Installation

```bash
git clone <repository-url>
cd aletheia
pnpm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL=your_neon_connection_string

# Google OAuth (Better Auth)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Better Auth
BETTER_AUTH_SECRET=your_secret_key

# Google Generative AI
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

# Lighthouse (IPFS)
LIGHTHOUSE_API_KEY=your_lighthouse_api_key
```

For Google OAuth, set the authorized redirect URI in the Google Cloud Console to:

```
http://localhost:3000/api/auth/callback/google
```

### Database Setup

Push the schema to your Neon database:

```bash
pnpm db:push
```

To seed initial data:

```bash
pnpm db:seed
```

To open Drizzle Studio for database inspection:

```bash
pnpm db:studio
```

### Development

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

---

## User Flows

### Investor

1. Navigate to `/sign-in`, select the Investor role, and authenticate with Google.
2. On the dashboard at `/investor/dashboard`, click "Create Upload Link" to generate a one-time token.
3. Copy the link URL and share it with a supplier out of band (email, Slack, etc.).
4. Once the supplier uploads their report, the link status changes to "Uploaded".
5. Click "View Report" on any completed link to open the full analysis at `/upload/[token]`.
6. The report view includes the AI-generated ESG score, charts, GRI compliance breakdown, and an interactive chat interface.

### Supplier

1. Navigate to `/sign-in`, select the Supplier role, and authenticate with Google.
2. Open the link received from an investor (e.g., `https://app.com/upload/abc123...`).
3. Select a `.csv` file from your local machine (max 10MB).
4. Click "Upload and Analyze" — the system validates, hashes, stores, pins to IPFS, and runs AI analysis.
5. The report view opens immediately with the full analysis result.
6. The dashboard at `/supplier/dashboard` shows all assigned links and their submission status.

---

## Project Structure

```
.
├── app/
│   ├── page.tsx                    # Landing page (public)
│   ├── layout.tsx                  # Root layout with font and global providers
│   ├── globals.css                 # Global styles and CSS variables
│   ├── sign-in/page.tsx            # Authentication page with role selection
│   ├── investor/
│   │   ├── profile/page.tsx        # Investor profile (identity, account details)
│   │   └── dashboard/page.tsx      # Upload link creation and management table
│   ├── supplier/
│   │   ├── profile/page.tsx        # Supplier profile (same structure, indigo accent)
│   │   └── dashboard/page.tsx      # Submitted report history
│   ├── upload/
│   │   ├── layout.tsx              # Upload section layout wrapper
│   │   ├── page.tsx                # Generic upload interface (direct access)
│   │   └── [token]/
│   │       ├── layout.tsx          # Token upload layout
│   │       └── page.tsx            # Token-gated supplier upload page
│   └── api/
│       ├── auth/[...all]/          # Better Auth catch-all handler
│       ├── role/route.ts           # POST: register role, GET: lookup role
│       ├── links/
│       │   ├── route.ts            # POST: create link, GET: list links
│       │   └── [token]/route.ts    # GET: fetch single link + associated report
│       ├── upload/
│       │   ├── route.ts            # POST: direct CSV upload (no token)
│       │   └── [token]/route.ts    # POST: token-gated upload + IPFS + AI analysis
│       └── chat/route.ts           # POST: invoke AI agent with user message
│
├── core/
│   ├── db/
│   │   ├── index.ts                # Drizzle database instance (Neon HTTP driver)
│   │   ├── schema.ts               # Application table definitions
│   │   └── seed.ts                 # Database seed script
│   ├── agent/
│   │   └── pdf-agent.ts            # createCsvAgent, invokeCsvAgent, runAutoAnalysis
│   └── tool/
│       ├── chart-generator.ts      # LangChain tool: generate_chart
│       ├── auto-chart-generator.ts # LangChain tool: generate_overview_charts
│       ├── report-analyzer.ts      # LangChain tool: analyze_sustainability_report
│       └── csv-loader.ts           # CSV text-to-JSON parser utility
│
├── components/
│   ├── AnalysisDashboard.tsx       # ESG score ring, charts, merits, GRI compliance
│   ├── ChatInterface.tsx           # Scrollable chat panel with message history
│   ├── CsvPreview.tsx              # Paginated, scrollable raw CSV data table
│   ├── UploadForm.tsx              # Drag-and-drop CSV upload form (generic)
│   ├── ConditionalLayout.tsx       # Suppresses landing-page Navbar/Footer on app routes
│   ├── ChartRenderer.tsx           # Renders Chart.js configs returned by the agent
│   ├── landingpage/
│   │   ├── Navbar.tsx
│   │   ├── HeroScroll.tsx
│   │   ├── Features.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── ValueCreated.tsx
│   │   ├── Footer.tsx
│   │   ├── ScrollProgress.tsx
│   │   └── LenisProvider.tsx       # Lenis smooth scroll context
│   └── ui/                         # shadcn/ui: Avatar, Badge, Button, Card, Input, Separator
│
├── lib/
│   ├── auth.ts                     # Better Auth server config (providers, session, adapter)
│   ├── auth-client.ts              # createAuthClient export (useSession, signIn, signOut)
│   ├── db/auth-schema.ts           # Better Auth managed tables
│   └── utils.ts                    # cn() helper (clsx + tailwind-merge)
│
├── store/
│   └── uploadStore.ts              # Zustand store: pdfUploadId, threadId, autoAnalysis, csvData
│
├── types/
│   └── index.ts                    # Shared interfaces: CsvUploadResponse, AutoAnalysisResult,
│                                   # ChatMessage, ChartConfig, AgentResponse, Supplier, Investor
│
├── middleware.ts                   # Cookie-based route protection
├── drizzle.config.ts               # Drizzle Kit configuration
├── migrate.ts                      # Standalone schema migration script
└── migrate-schema.ts               # Standalone Better Auth schema migration
```

---

## Database Schema

The application uses two separate sets of tables managed separately by separate Drizzle configurations.

### Application Tables (`core/db/schema.ts`)

**`suppliers`**

| Column     | Type      | Constraints   | Description                           |
|------------|-----------|---------------|---------------------------------------|
| id         | uuid      | PK, default   | Auto-generated primary key            |
| name       | text      | NOT NULL      | Full name sourced from Google profile |
| email      | text      | UNIQUE        | Used as the role identity key         |
| created_at | timestamp | DEFAULT NOW() | Account creation timestamp            |

**`investors`**

| Column | Type | Constraints | Description                           |
|--------|------|-------------|---------------------------------------|
| id     | uuid | PK, default | Auto-generated primary key            |
| email  | text | UNIQUE      | Used as the role identity key         |

**`upload_links`**

| Column           | Type      | Constraints   | Description                                              |
|------------------|-----------|---------------|----------------------------------------------------------|
| id               | uuid      | PK, default   | Auto-generated primary key                               |
| token            | text      | UNIQUE        | 48-char hex random token (24 bytes via crypto.randomBytes) |
| investor_user_id | text      | NOT NULL      | References Better Auth `user.id`                         |
| supplier_user_id | text      |               | Set when a supplier uses the link                        |
| status           | text      | DEFAULT pending | `pending` or `used`                                    |
| upload_id        | uuid      |               | FK to `csv_uploads.id`, set on successful upload         |
| created_at       | timestamp | DEFAULT NOW() | Link creation timestamp                                  |

**`csv_uploads`**

| Column           | Type      | Constraints    | Description                                     |
|------------------|-----------|----------------|-------------------------------------------------|
| id               | uuid      | PK, default    | Auto-generated primary key                      |
| supplier_id      | uuid      | FK suppliers   | Domain-level supplier reference                 |
| investor_id      | uuid      | FK investors   | Domain-level investor reference                 |
| investor_user_id | text      |                | Auth-level investor user ID                     |
| supplier_user_id | text      |                | Auth-level supplier user ID                     |
| link_token       | text      |                | The token used to submit this upload            |
| parsed_data      | jsonb     | NOT NULL       | Full CSV as JSON array of row objects           |
| file_name        | text      | NOT NULL       | Original filename as submitted                  |
| file_hash        | text      | NOT NULL       | SHA-256 hex digest of the raw file buffer       |
| file_size        | integer   | NOT NULL       | Size in bytes                                   |
| ipfs_cid         | text      |                | Lighthouse IPFS content identifier              |
| ipfs_url         | text      |                | Public IPFS gateway URL for the pinned file     |
| analysis_result  | jsonb     |                | Full `AutoAnalysisResult` object from Gemini    |
| upload_locked    | boolean   | DEFAULT true   | Structural immutability flag                    |
| uploaded_at      | timestamp | DEFAULT NOW()  | Upload timestamp                                |
| anomaly_score    | integer   | DEFAULT 0      | Reserved field for future anomaly detection     |

### Auth Tables (`lib/db/auth-schema.ts`)

Managed by Better Auth. Not modified by application code.

| Table          | Purpose                                              |
|----------------|------------------------------------------------------|
| `user`         | Core user identity (id, name, email, emailVerified, image) |
| `session`      | Active sessions (token, expiresAt, userId)           |
| `account`      | OAuth account links (providerId, accessToken, etc.)  |
| `verification` | Email verification tokens (unused in current config) |

### Entity Relationships

```
user (Better Auth)
  |
  |-- investors (email match, email is the FK bridge)
  |     |-- upload_links (investorUserId = user.id)
  |           |-- csv_uploads (via uploadId)
  |
  |-- suppliers (email match)
        |-- upload_links (supplierUserId = user.id)
        |-- csv_uploads (supplierId FK)
```

---

## API Reference

### `POST /api/role`

Registers the authenticated user into the investor or supplier table.

**Request body:**
```json
{ "role": "investor" | "supplier" }
```

**Response:**
```json
{ "success": true, "role": "investor" }
```

Uses `onConflictDoNothing` on the email column so repeated calls (e.g., repeated sign-ins) are idempotent.

---

### `GET /api/role`

Returns the current user's registered role.

**Response:**
```json
{ "success": true, "role": "investor" | "supplier" | null }
```

---

### `POST /api/links`

Creates a new one-time upload link. Investor-only by convention (no server-side role check; the link is owned by whoever calls it).

**Response:**
```json
{
  "success": true,
  "link": { "id", "token", "uploadUrl", "status", "createdAt" }
}
```

---

### `GET /api/links`

Returns all links associated with the current user. The server determines role by checking the `investors` table.

- Investors receive links where `investorUserId` matches their session.
- Suppliers receive links where `supplierUserId` matches their session.
- Used links include a `report` object with file metadata.

---

### `GET /api/links/[token]`

Returns a single link by token, including the full report and analysis result if uploaded.

---

### `POST /api/upload/[token]`

Accepts a multipart form upload from a supplier. Expects a `.csv` file attached as `file`. Performs the full pipeline: validate, hash, parse, store, pin to IPFS, run AI analysis.

**Response:**
```json
{
  "success": true,
  "upload": { "id", "fileName", "fileHash", "fileSize", "uploadedAt" },
  "autoAnalysis": { "summary", "esgScore", "charts", "analysis" }
}
```

---

### `POST /api/chat`

Invokes the LangChain agent with a user message in the context of a specific upload.

**Request body:**
```json
{ "message": "string", "pdfUploadId": "string", "threadId": "string" }
```

**Response:**
```json
{
  "message": "string",
  "chartConfig": { ... },
  "reportAnalysis": { ... },
  "threadId": "string"
}
```

---

## AI Analysis Pipeline

### Auto-Analysis on Upload

When a file is submitted via `POST /api/upload/[token]`, `runAutoAnalysis()` is called immediately. It uses `ChatGoogleGenerativeAI.withStructuredOutput()` bound to a Zod schema, which instructs Gemini to return a strictly typed JSON object rather than free-form text.

The Zod schema enforces:

- `summary` — string, 1–3 sentence executive summary
- `esgScore` — integer 0–100
- `charts` — array of 2–3 chart definitions (type, title, labels, datasets, insight)
- `merits` — 3–6 strings identifying reporting strengths
- `improvements` — 3–6 strings identifying weaknesses
- `griCompliance.score` — integer 0–100
- `griCompliance.coveredStandards` — GRI standard codes found in the data
- `griCompliance.missingStandards` — GRI standard codes absent from the data
- `recommendations` — 3–5 actionable improvement strings

If the analysis fails (model error, timeout, malformed content), the upload is not rolled back. A fallback `AutoAnalysisResult` with zero scores and empty arrays is returned so the upload still succeeds and the interface does not break.

### GRI Standards Assessed

| Standard | Topic                      |
|----------|----------------------------|
| GRI 302  | Energy consumption          |
| GRI 303  | Water withdrawal            |
| GRI 305  | GHG emissions (Scope 1/2/3) |
| GRI 306  | Waste generation            |
| GRI 401  | Employment                  |
| GRI 403  | Occupational safety         |
| GRI 404  | Training and education      |
| GRI 405  | Diversity and inclusion      |

### Interactive Chat Agent

The chat agent is built with LangChain's `createAgent()` using the ReAct (Reasoning + Acting) pattern. The full CSV data is embedded in the system prompt for every request, giving the model complete context without vector search or retrieval.

Agent tools:

| Tool Name                         | Input                                      | Output                   |
|-----------------------------------|--------------------------------------------|--------------------------|
| `generate_chart`                  | Chart type, title, labels, dataset values  | Chart.js config JSON     |
| `generate_overview_charts`        | Automatic based on CSV context             | Array of Chart.js configs |
| `analyze_sustainability_report`   | CSV context                                | GRI compliance analysis  |

The `threadId` is passed as a LangGraph configurable parameter, enabling multi-turn conversation memory within a session.

---

## Authentication and Authorization

### Session Management

Better Auth manages sessions using signed HTTP-only cookies. Sessions expire after 7 days and are refreshed if they are older than 24 hours. The session cookie name is `better-auth.session_token` (or `__Secure-better-auth.session_token` in production with HTTPS).

### Role System

Aletheia uses a bespoke role system rather than a column on the auth user table. On first sign-in, the selected role is registered by upserting a row into either `investors` or `suppliers` with the user's email. Role lookup is done by querying these tables.

This design means:

- A user with a given Google account can only be registered as one role (first registration wins due to the email unique constraint and `onConflictDoNothing`).
- Switching roles requires manual database intervention.
- Role detection is done on the server inside each API route that needs it, not in middleware, which avoids a database call on every request.

### Route Protection

`middleware.ts` uses a cookie presence check (not a database call) to determine authentication status. This is a lightweight guard to redirect unauthenticated users. Actual authorization (checking session validity and user permissions) is done inside each API route handler by calling `auth.api.getSession({ headers: request.headers })`.

---

## Data Integrity and IPFS

### Upload Immutability

Once a CSV is submitted:

1. The `upload_links.status` is set to `used`. No further uploads are accepted for that token.
2. The `csv_uploads.uploadLocked` column is set to `true` on insertion and never updated.
3. No delete routes exist for CSV records in the public API.

### Hash Verification

The SHA-256 hash stored in `csv_uploads.fileHash` allows independent verification:

```bash
sha256sum report.csv
# Compare output to the fileHash value in the database
```

### IPFS Permanence

Files pinned via Lighthouse remain on IPFS as long as the Lighthouse account maintains the pin. The IPFS CID is content-addressed, meaning any change to the file produces a completely different CID, making substitution detectable.

---

## Frontend Architecture

### Layout Strategy

`ConditionalLayout.tsx` wraps the root layout and checks the current pathname. On routes under `/upload`, `/investor`, `/supplier`, and `/sign-in`, it suppresses the landing-page Navbar and Footer. This avoids duplicating layout logic across every app route while keeping the landing page visually distinct.

### State Management

| Scope                  | Tool                  | Persistence  |
|------------------------|-----------------------|--------------|
| Server session data    | Better Auth / React   | Cookie       |
| Upload analysis state  | Zustand               | localStorage |
| Local UI state         | React useState        | None         |

The Zustand store (`uploadStore.ts`) holds the state needed after a successful upload: the upload ID (for chat), the thread ID, the auto-analysis result, and the parsed CSV structure. All values are persisted to localStorage so a page refresh does not lose the active analysis session.

### Component Boundaries

- `AnalysisDashboard` is a pure presentational component that receives an `AutoAnalysisResult` and renders the ESG score, charts via `ChartRenderer`, and the analysis breakdown.
- `ChatInterface` manages its own local message state and makes fetch calls to `/api/chat`. It receives `pdfUploadId` and `threadId` as props.
- `CsvPreview` receives pre-parsed `headers` and `rows` arrays and handles its own pagination state.

### Animation and Scroll

- **Lenis** provides smooth native scroll behavior and is configured in `LenisProvider.tsx` as a React context wrapping the landing page.
- **GSAP** handles timeline-based scroll animations on the landing page sections.
- **Framer Motion** handles page-level entrance animations and transitions on dashboard and profile pages.

---

## Scripts

| Script              | Description                                            |
|---------------------|--------------------------------------------------------|
| `pnpm dev`          | Start development server with hot reload               |
| `pnpm build`        | Build the production bundle                            |
| `pnpm start`        | Start the production server                            |
| `pnpm lint`         | Run ESLint across the codebase                         |
| `pnpm db:generate`  | Generate Drizzle migration files from schema changes   |
| `pnpm db:push`      | Push schema directly to the database (no migrations)   |
| `pnpm db:studio`    | Open Drizzle Studio browser UI for database inspection |
| `pnpm db:seed`      | Run the seed script to populate initial data           |
