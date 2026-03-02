# Quick Test Guide

## Copy These IDs (from seed script output):

```
Supplier ID: 9d4b3d99-231e-40f3-bab8-83cde77cf65a
Investor ID: 71fb7399-6015-4857-990e-8d46d548ba41
```

## Test Steps:

1. **Start the server**:

   ```bash
   pnpm dev
   ```

2. **Navigate to**: http://localhost:3000/upload

3. **Fill in the form**:
   - Supplier ID: `9d4b3d99-231e-40f3-bab8-83cde77cf65a`
   - Investor ID: `71fb7399-6015-4857-990e-8d46d548ba41`
   - Upload a PDF file (sustainability report recommended)

4. **Once uploaded, try these questions**:
   - "What are the main topics covered in this document?"
   - "Summarize the key sustainability metrics"
   - "Create a bar chart showing any numerical data you find"
   - "What environmental goals are mentioned?"

5. **Verify Database**:

   ```bash
   pnpm db:studio
   ```

   - Check `pdf_uploads` table for your upload
   - Check `chat_threads` table for conversation
   - Check `chat_messages` table for message history

## Expected Behavior:

✅ PDF uploads to Vercel Blob
✅ Metadata saved to Neon database
✅ SHA-256 hash calculated and stored
✅ Chat interface appears after upload
✅ AI responds based on PDF content
✅ Charts render inline when requested
✅ All messages persisted to database

## Troubleshooting:

❌ **"Supplier/Investor not found"**
→ Run: `pnpm db:seed` and copy the new UUIDs

❌ **"Failed to upload PDF"**
→ Check `BLOB_READ_WRITE_TOKEN` in `.env.local`

❌ **"Failed to process chat message"**
→ Check `GOOGLE_GENERATIVE_AI_API_KEY` in `.env.local`

❌ **Database connection error**
→ Verify `DATABASE_URL` in `.env.local`
