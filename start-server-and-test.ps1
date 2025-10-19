# Start Astro dev server and run tests
# This script starts the server, waits for it to be ready, runs tests, and cleans up

Write-Host "`n🚀 Starting Astro dev server..." -ForegroundColor Cyan

# Check if OPENAI_API_KEY is set
if (-not $env:OPENAI_API_KEY) {
    Write-Host "⚠️  WARNING: OPENAI_API_KEY not set" -ForegroundColor Yellow
    Write-Host "   Test 1 (Successful Generation) will fail without a valid API key" -ForegroundColor Yellow
    Write-Host "   Other tests will still run (validation, auth, authorization)`n" -ForegroundColor Yellow
    
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        Write-Host "❌ Tests cancelled. Please set OPENAI_API_KEY and try again." -ForegroundColor Red
        exit 1
    }
}

# Start dev server in background
$serverProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -NoNewWindow

Write-Host "⏳ Waiting for server to start (30 seconds)..." -ForegroundColor Cyan

# Wait for server to be ready (check every 2 seconds for 30 seconds)
$maxAttempts = 15
$attempt = 0
$serverReady = $false

while ($attempt -lt $maxAttempts -and -not $serverReady) {
    Start-Sleep -Seconds 2
    $attempt++
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4321" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $serverReady = $true
            Write-Host "✅ Server is ready!" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "." -NoNewline -ForegroundColor Gray
    }
}

if (-not $serverReady) {
    Write-Host "`n❌ Server failed to start within 30 seconds" -ForegroundColor Red
    Stop-Process -Id $serverProcess.Id -Force
    exit 1
}

Write-Host "`n"

# Run tests
try {
    & .\test-manual.ps1
    $testResult = $LASTEXITCODE
}
finally {
    # Cleanup: Stop the dev server
    Write-Host "`n🛑 Stopping dev server..." -ForegroundColor Cyan
    Stop-Process -Id $serverProcess.Id -Force
    Write-Host "✅ Server stopped`n" -ForegroundColor Green
}

exit $testResult

