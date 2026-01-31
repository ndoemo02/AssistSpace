# gemini.md - Project Map & Source of Truth

**Status**: Architecting & Building
**Phase**: A - Architect

## 0. Project State
- [x] Discovery Questions Answered
- [x] Blueprint Approved
- [x] Infrastructure Linked (Pending Supabase Restore)
- [ ] Architecture Defined
- [ ] Tools Implemented

## 1. Discovery
### North Star (Singular Desired Outcome)
**AI News Aggregator & Archiver**: Autonomous agent that scans Reddit & YouTube for AI news daily, generates intelligent summaries/categorization via Gemini API, and archives them into Google Sheets/Docs.

### Integrations (External Stack)
- **Reddit API**: Subreddits (r/ArtificialInteligence, r/OpenAI, r/MachineLearning).
- **YouTube Data API**: Channels (Matt Wolfe, Two Minute Papers, etc.).
- **Google Workspace (Sheets/Docs)**: Storage & Archiving.
- **Gemini API**: Content analysis, summarization, categorization.
- **Frontend**: Minimalist Dark Mode Dashboard.

### Data (Specific Data to Move)
- Title & Source Link
- AI-Generated Summary (3-5 boolean points)
- Category (e.g., "LLM", "Video Gen", "Productivity")
- Publication Date

### Triggers
- **Manual**: "Generate Daily Report" button on dashboard.
- **Time**: Cron job daily at 08:00 AM.

### Stylize (UX/UI)
- Minimalist Dark Mode.
- News Cards with Category Tags and "Open Source" button.
- "Quick Stats" section (count of gathered news).

## 2. Data Schemas

### Core Entity: `NewsItem`
```json
{
  "id": "string (UUID)",
  "source_platform": "reddit" | "youtube",
  "title": "string",
  "url": "string",
  "published_at": "ISO-8601 string",
  "summary_points": ["string", "string", "string"],
  "category": "string",
  "author_or_channel": "string",
  "raw_content": "string (text body or transceiver transcript)"
}
```

### Report Entity: `DailyReport`
```json
{
  "id": "string (UUID)",
  "date": "YYYY-MM-DD",
  "total_items": "integer",
  "items": ["NewsItem"],
  "gdrive_doc_link": "string (url)",
  "gdrive_sheet_link": "string (url)"
}
```

## 3. Behavioral Rules
- **Reliability First**: If an API fails, log the error and continue with other sources. Do not crash the entire run.
- **No Duplicates**: Check against previous days or existing URLs to prevent duplicate entries.
- **Strict Parsing**: Ensure summaries are strictly bullet points, no conversational filler.

## 4. Architecture (SOPs)
*To be defined in Phase L (Link) and A (Architect)*
