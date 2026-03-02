# Aletheia PDF Analyzer

A Next.js application that allows suppliers to upload sustainability reports and interact with an AI agent powered by Google Gemini and LangGraph. The agent can analyze PDF content, answer questions, and generate data visualizations.

## Features

- **PDF Upload**: Secure upload of sustainability reports to Vercel Blob storage
- **AI-Powered Analysis**: Google Gemini analyzes PDF content and answers questions
- **Chart Generation**: Automatically generates visualizations from data in PDFs
- **Conversational Memory**: LangGraph with MemorySaver maintains context across questions
- **Real-time Chat**: Interactive chat interface with streaming responses

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **AI/LLM**: Google Gemini via LangChain
- **Agent Framework**: LangGraph with MemorySaver
- **PDF Processing**: pdf-parse with LangChain PDFLoader
- **File Storage**: Vercel Blob
- **Charts**: Chart.js with react-chartjs-2
- **UI Components**: shadcn/ui with Tailwind CSS
- **Type Safety**: TypeScript with Zod validation

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Create a `.env.local` file with the following:

```env
# Google Gemini API Key
# Get your API key from: https://ai.google.dev/
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key_here

# Vercel Blob Storage Token
# Get this from: https://vercel.com/dashboard/stores
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here
```

### 3. Get Your API Keys

**Google Gemini API Key:**

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env.local` file

**Vercel Blob Token:**

1. Visit [Vercel Dashboard](https://vercel.com/dashboard/stores)
2. Create a new Blob store
3. Copy the read/write token
4. Add it to your `.env.local` file

### 4. Run Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000/upload](http://localhost:3000/upload) to use the application.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── upload/        # PDF upload endpoint
│   │   └── chat/          # Chat with AI agent endpoint
│   └── upload/            # Upload page UI
├── components/
│   ├── UploadForm.tsx     # PDF upload component
│   ├── ChatInterface.tsx  # Chat UI with message history
│   └── ChartRenderer.tsx  # Chart.js visualization renderer
├── core/
│   ├── agent/
│   │   └── pdf-agent.ts   # LangGraph agent with Gemini
│   └── tool/
│       ├── pdf-loader.ts  # PDF parsing utility
│       └── chart-generator.ts  # Chart generation tool
└── types/
    └── index.ts           # TypeScript type definitions
```

## Usage

### 1. Upload a PDF

Navigate to `/upload` and select a sustainability report PDF (max 10MB).

### 2. Ask Questions

Once uploaded, you can ask questions about the PDF:

- "What are the key sustainability metrics in this report?"
- "Summarize the carbon emissions data"
- "What are the main environmental goals?"

### 3. Generate Charts

Request visualizations from the data:

- "Create a bar chart of emissions by year"
- "Show me a pie chart of energy sources"
- "Plot the water usage trends as a line chart"

The AI agent will automatically extract data from the PDF and generate Chart.js visualizations.

## How It Works

1. **Upload**: PDF is uploaded to Vercel Blob and returns a permanent URL
2. **Parse**: LangChain PDFLoader extracts and chunks the text content
3. **Context Injection**: PDF content is injected into the agent's system prompt
4. **Agent Processing**: LangGraph agent with Google Gemini analyzes the content
5. **Tool Execution**: When requested, the chart generation tool creates visualizations
6. **Memory**: MemorySaver maintains conversation context across messages

## API Routes

### POST /api/upload

Upload a PDF file.

**Request**: multipart/form-data with `file` field

**Response**:

```json
{
  "success": true,
  "url": "https://blob.vercel-storage.com/...",
  "message": "PDF uploaded successfully"
}
```

### POST /api/chat

Send a message to the AI agent.

**Request**:

```json
{
  "message": "What are the key metrics?",
  "pdfUrl": "https://blob.vercel-storage.com/...",
  "threadId": "unique-thread-id"
}
```

**Response**:

```json
{
  "message": "The report shows three key metrics...",
  "chartConfig": {
    /* Chart.js config if generated */
  },
  "threadId": "unique-thread-id"
}
```

## Future Enhancements

- [ ] Blockchain anchoring for immutable audit trail (Hyperledger Fabric/Polygon)
- [ ] Multi-document comparison and analysis
- [ ] Government monitoring layer for malpractice detection
- [ ] Support for multiple file formats (Excel, Word, images)
- [ ] Advanced anomaly detection with statistical models
- [ ] Export reports and insights as PDF/CSV

## License

Private project for Aletheia platform.
