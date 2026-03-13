# Setup complete

## What's installed

| Component | Status |
|-----------|--------|
| npm dependencies | ✓ Installed |
| Prisma / SQLite DB | ✓ Schema synced (`dev.db`) |
| cloudflared | ✓ Installed via winget |
| Ollama | ✓ Detected (llama3.1:8b available) |

## Run the app

```bash
cd recruiter-platform
npm run dev
```

Open http://localhost:3000 (or 3001/3002 if ports are in use).

## Use Ollama

1. **Start Ollama** (if not already running): `ollama serve`
2. The app uses `llama3.1:8b` by default. Change via `OLLAMA_MODEL` in `.env`.

## Cloudflare tunnel (for Vercel)

1. **Open a new terminal** (PATH updates after cloudflared install).
2. Start Ollama: `ollama serve`
3. Run: `npm run tunnel` or `cloudflared tunnel --url http://localhost:11434`
4. Copy the generated URL → Vercel → Settings → Environment Variables → `OLLAMA_BASE_URL`
5. Redeploy.

## Note on Prisma

If you see `EPERM` when running `prisma generate`, stop the dev server first, then run:

```bash
npx prisma generate
npx prisma db push
```
