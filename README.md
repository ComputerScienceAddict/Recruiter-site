# Recruit — Candidate Analysis Platform

A premium internal recruiting tool for screening candidates against job descriptions. Uses **Ollama** running locally for private, on-device AI analysis. No external API keys required.

## Features

- **Multi-format upload**: PDF, DOCX, TXT resumes + LinkedIn Recruiter CSV exports
- **Job description matching**: Describe the role or paste requirements
- **Optional filters**: Required/preferred skills, experience, location, education, seniority, dealbreakers
- **Local AI analysis**: Ollama-powered candidate scoring, summaries, strengths/weaknesses, and outreach
- **Ranked results**: Sort by score or name, filter by shortlist, compare candidates
- **Personalized outreach**: Editable, human-sounding messages for top candidates
- **Session history**: Reopen past analyses, export shortlists to CSV

## Prerequisites

1. **Node.js** 18+
2. **Ollama** installed and running locally ([ollama.ai](https://ollama.ai))
3. A suitable model pulled, e.g. `ollama pull llama3.1:8b`

## Setup

### 1. Install dependencies

```bash
cd recruiter-platform
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` if needed:

```
DATABASE_URL="file:./dev.db"
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="llama3.1:8b"
```

### 3. Initialize database

```bash
npm run db:generate
npm run db:push
```

### 4. Start Ollama (if not already running)

```bash
ollama serve
ollama pull llama3.1:8b
```

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
recruiter-platform/
├── prisma/
│   └── schema.prisma       # SQLite schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── upload/parse/   # Parse resumes/CSV
│   │   │   ├── analyze/        # Run Ollama analysis
│   │   │   ├── sessions/       # List & fetch sessions
│   │   │   ├── candidates/     # Shortlist
│   │   │   ├── ollama/health/  # Ollama status
│   │   │   └── export/csv/     # Export candidates
│   │   ├── page.tsx            # Main analysis page
│   │   ├── results/[id]/       # Results dashboard
│   │   └── sessions/           # Session history
│   ├── components/
│   ├── lib/
│   │   ├── parsers/            # PDF, DOCX, TXT, CSV
│   │   ├── ollama.ts           # Ollama API wrapper
│   │   ├── analysis-prompt.ts  # Prompt templates
│   │   ├── analysis-pipeline.ts
│   │   ├── scoring.ts          # Rule-based scoring
│   │   └── db.ts               # Prisma helpers
│   └── types/
```

## Changing the model

Set `OLLAMA_MODEL` in `.env` to any model you have pulled, e.g.:

- `llama3.1:8b` (default) — good balance of speed and quality
- `llama3.1:70b` — higher quality, slower
- `mistral` — alternative
- `codellama` — better for technical roles

## Changing prompts

Edit `src/lib/analysis-prompt.ts`. The `buildAnalysisPrompt` function constructs the system + user prompt. The model is instructed to return JSON with a fixed schema; adjust the field names there if you change the structure.

## Scoring logic

Two components:

1. **Rule-based**: `src/lib/scoring.ts` computes a preliminary score from:
   - Required/preferred skill overlap
   - Years of experience vs. requested range
   - Location match
   - Education presence

2. **LLM evaluation**: The local model receives the rule-based score as context and produces a final score, summary, strengths, weaknesses, and outreach. The combined approach keeps results grounded and consistent.

## Cloudflare Tunnel (Vercel + local Ollama)

To use your **Vercel-deployed app** with Ollama running on your PC, expose Ollama via a Cloudflare Quick Tunnel so the app can reach it over the internet.

### 1. Install cloudflared

**Windows (PowerShell):**
```powershell
winget install --id Cloudflare.cloudflared
```

**macOS:**
```bash
brew install cloudflared
```

**Or download:** [cloudflared releases](https://github.com/cloudflare/cloudflared/releases)

### 2. Start Ollama locally

```bash
ollama serve
ollama pull llama3.1:8b
```

### 3. Start the Cloudflare tunnel

```bash
npm run tunnel
```

Or directly:
```bash
cloudflared tunnel --url http://localhost:11434
```

> Use port **11434** (Ollama’s port), not 8080.

You’ll see output like:
```
Your quick Tunnel has been created! Visit it at:
https://abc-xyz-123.trycloudflare.com
```

### 4. Configure Vercel

1. Open your project on [vercel.com](https://vercel.com) → **Settings** → **Environment Variables**
2. Add: `OLLAMA_BASE_URL` = `https://abc-xyz-123.trycloudflare.com`
   - No trailing slash
   - Use the exact URL from the cloudflared output
3. Redeploy the app

### 5. Notes

- **Quick Tunnels change URL on restart.** Each time you run `cloudflared tunnel --url http://localhost:11434`, a new URL is generated. You must update `OLLAMA_BASE_URL` in Vercel and redeploy.
- **Security:** The tunnel URL is public. Anyone with it can use your Ollama instance. For testing only; do not share the URL.
- **Vercel + DB:** This app uses SQLite by default. For production on Vercel, switch to a hosted database (e.g. Vercel Postgres or Supabase) and set `DATABASE_URL` accordingly.

### Stable URL (optional)

For a fixed URL, use a [Cloudflare account and named tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/). That gives a permanent subdomain so you don’t have to update Vercel env vars after each tunnel restart.

### Quick tunnel fails

If you have a `~/.cloudflared/config.yaml` (or `.cloudflared/config.yaml`), Quick Tunnels may not work. Temporarily rename or move that file, then run the tunnel again.

---

## Troubleshooting

### Ollama not detected

- Ensure Ollama is running: `ollama serve`
- Check `OLLAMA_BASE_URL` (default `http://localhost:11434`)
- Verify a model is pulled: `ollama list`

### Parse errors

- PDF: Some scanned PDFs have no extractable text; use OCR first.
- CSV: LinkedIn export column names vary; the parser maps common ones. If your export uses different headers, you may need to adjust `src/lib/parsers/csv.ts`.

### Analysis timeout

- Use a smaller/faster model for large batches.
- The analyze route has `maxDuration = 300`; increase in `src/app/api/analyze/route.ts` if needed.
