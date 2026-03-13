# Start Ollama (if not running) and Cloudflare tunnel for Vercel
# Run: .\scripts\start-all.ps1

Write-Host "Checking Ollama..." -ForegroundColor Cyan
try {
    ollama list | Out-Null
    Write-Host "Ollama is running" -ForegroundColor Green
} catch {
    Write-Host "Starting Ollama..." -ForegroundColor Yellow
    Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 3
}

Write-Host "Starting Cloudflare tunnel..." -ForegroundColor Cyan
Write-Host "Keep this window open. Update OLLAMA_BASE_URL in Vercel with the URL shown below." -ForegroundColor Yellow
& "C:\Progra~2\cloudflared\cloudflared.exe" tunnel --url http://localhost:11434 --http-host-header localhost:11434
