# 🚀 Skrypt przygotowania aplikacji do wdrożenia na Mikrus
# Usage: .\prepare-deployment.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 Przygotowanie aplikacji do wdrożenia..." -ForegroundColor Cyan
Write-Host ""

# 1. Sprawdź czy plik .env istnieje
Write-Host "📋 Sprawdzanie konfiguracji..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "❌ Błąd: Plik .env nie istnieje!" -ForegroundColor Red
    Write-Host "Utwórz plik .env z wymaganymi zmiennymi:"
    Write-Host "  SUPABASE_URL=..."
    Write-Host "  SUPABASE_KEY=..."
    Write-Host "  OPENAI_API_KEY=..."
    exit 1
}
Write-Host "✅ Plik .env znaleziony" -ForegroundColor Green

# 2. Sprawdź czy Node.js jest zainstalowany
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js nie jest zainstalowany" -ForegroundColor Red
    exit 1
}

# 3. Sprawdź czy npm jest zainstalowany
try {
    $npmVersion = npm --version
    Write-Host "✅ npm $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm nie jest zainstalowany" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Instalowanie zależności..." -ForegroundColor Yellow
npm ci --production=false

Write-Host ""
Write-Host "🏗️  Budowanie aplikacji..." -ForegroundColor Yellow
npm run build

Write-Host ""
Write-Host "📊 Statystyki buildu:" -ForegroundColor Yellow
if (Test-Path "dist") {
    $distSize = (Get-ChildItem dist -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host ("  Rozmiar dist/: {0:N2} MB" -f $distSize)
    Write-Host "✅ Build zakończony pomyślnie" -ForegroundColor Green
} else {
    Write-Host "❌ Folder dist/ nie został utworzony!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Przygotowanie plików do deployment..." -ForegroundColor Yellow

# Utwórz folder deployment jeśli nie istnieje
if (-not (Test-Path "deployment")) {
    New-Item -ItemType Directory -Path "deployment" | Out-Null
}

# Stwórz ecosystem.config.cjs jeśli nie istnieje
if (-not (Test-Path "ecosystem.config.cjs")) {
    Write-Host "⚙️  Tworzenie ecosystem.config.cjs..." -ForegroundColor Yellow
    $ecosystemConfig = @"
module.exports = {
  apps: [{
    name: '10x-flashcards',
    script: './dist/server/entry.mjs',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '500M'
  }]
};
"@
    $ecosystemConfig | Out-File -FilePath "ecosystem.config.cjs" -Encoding UTF8
    Write-Host "✅ ecosystem.config.cjs utworzony" -ForegroundColor Green
}

# Utwórz archiwum (wymaga 7-Zip lub tar w Windows)
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$archiveName = "deployment/10x-app-$timestamp.zip"

Write-Host "📦 Tworzenie archiwum: $archiveName" -ForegroundColor Yellow

# Użyj Compress-Archive (wbudowane w PowerShell)
$filesToCompress = @(
    "dist",
    "package.json",
    "package-lock.json",
    "ecosystem.config.cjs"
)

# Dodaj .env jeśli istnieje
if (Test-Path ".env") {
    $filesToCompress += ".env"
}

try {
    Compress-Archive -Path $filesToCompress -DestinationPath $archiveName -Force
    $archiveSize = (Get-Item $archiveName).Length / 1MB
    Write-Host ("✅ Archiwum utworzone: $archiveName ({0:N2} MB)" -f $archiveSize) -ForegroundColor Green
} catch {
    Write-Host "❌ Błąd podczas tworzenia archiwum: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "✅ Przygotowanie zakończone pomyślnie!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "📤 Następne kroki:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Prześlij archiwum na serwer Mikrus:" -ForegroundColor White
Write-Host "   " -NoNewline
Write-Host "scp $archiveName twoja-nazwa@twoj-serwer.mikr.us:~/" -ForegroundColor Yellow
Write-Host "   " -NoNewline
Write-Host "LUB użyj WinSCP / FileZilla" -ForegroundColor Gray
Write-Host ""
Write-Host "2️⃣  Zaloguj się na serwer:" -ForegroundColor White
Write-Host "   " -NoNewline
Write-Host "ssh twoja-nazwa@twoj-serwer.mikr.us" -ForegroundColor Yellow
Write-Host "   " -NoNewline
Write-Host "LUB użyj PuTTY" -ForegroundColor Gray
Write-Host ""
Write-Host "3️⃣  Rozpakuj archiwum na serwerze:" -ForegroundColor White
Write-Host "   " -NoNewline
Write-Host "mkdir -p ~/apps/10x-flashcards" -ForegroundColor Yellow
Write-Host "   " -NoNewline
Write-Host "cd ~/apps/10x-flashcards" -ForegroundColor Yellow
Write-Host "   " -NoNewline
Write-Host "unzip ~/10x-app-$timestamp.zip" -ForegroundColor Yellow
Write-Host ""
Write-Host "4️⃣  Zainstaluj zależności (na serwerze):" -ForegroundColor White
Write-Host "   " -NoNewline
Write-Host "npm ci --production" -ForegroundColor Yellow
Write-Host ""
Write-Host "5️⃣  Uruchom aplikację:" -ForegroundColor White
Write-Host "   " -NoNewline
Write-Host "pm2 start ecosystem.config.cjs" -ForegroundColor Yellow
Write-Host "   " -NoNewline
Write-Host "pm2 save" -ForegroundColor Yellow
Write-Host ""
Write-Host "📖 Więcej informacji: " -NoNewline
Write-Host "MIKRUS-DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host ""


