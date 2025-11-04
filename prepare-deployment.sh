#!/bin/bash

# 🚀 Skrypt przygotowania aplikacji do wdrożenia na Mikrus
# Usage: ./prepare-deployment.sh

set -e  # Zatrzymaj przy błędzie

echo "🚀 Przygotowanie aplikacji do wdrożenia..."
echo ""

# Kolory dla outputu
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Sprawdź czy plik .env istnieje
echo "📋 Sprawdzanie konfiguracji..."
if [ ! -f .env ]; then
    echo -e "${RED}❌ Błąd: Plik .env nie istnieje!${NC}"
    echo "Utwórz plik .env z wymaganymi zmiennymi:"
    echo "  SUPABASE_URL=..."
    echo "  SUPABASE_KEY=..."
    echo "  OPENAI_API_KEY=..."
    exit 1
fi
echo -e "${GREEN}✅ Plik .env znaleziony${NC}"

# 2. Sprawdź czy Node.js jest zainstalowany
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js nie jest zainstalowany${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version)${NC}"

# 3. Sprawdź czy npm jest zainstalowany
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm nie jest zainstalowany${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm --version)${NC}"

echo ""
echo "📦 Instalowanie zależności..."
npm ci --production=false

echo ""
echo "🏗️  Budowanie aplikacji..."
npm run build

echo ""
echo "📊 Statystyki buildu:"
if [ -d "dist" ]; then
    DIST_SIZE=$(du -sh dist | cut -f1)
    echo "  Rozmiar dist/: $DIST_SIZE"
    echo -e "${GREEN}✅ Build zakończony pomyślnie${NC}"
else
    echo -e "${RED}❌ Folder dist/ nie został utworzony!${NC}"
    exit 1
fi

echo ""
echo "📦 Tworzenie archiwum deployment..."

# Utwórz folder deployment jeśli nie istnieje
mkdir -p deployment

# Lista plików do spakowania
cat > /tmp/deploy-files.txt << EOF
dist/
package.json
package-lock.json
ecosystem.config.cjs
.env
EOF

# Stwórz ecosystem.config.cjs jeśli nie istnieje
if [ ! -f ecosystem.config.cjs ]; then
    echo "⚙️  Tworzenie ecosystem.config.cjs..."
    cat > ecosystem.config.cjs << 'EOFCONFIG'
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
EOFCONFIG
    echo -e "${GREEN}✅ ecosystem.config.cjs utworzony${NC}"
fi

# Spakuj pliki
ARCHIVE_NAME="deployment/10x-app-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf "$ARCHIVE_NAME" dist/ package.json package-lock.json ecosystem.config.cjs .env 2>/dev/null || {
    # Fallback bez .env jeśli nie istnieje
    tar -czf "$ARCHIVE_NAME" dist/ package.json package-lock.json ecosystem.config.cjs
}

ARCHIVE_SIZE=$(du -sh "$ARCHIVE_NAME" | cut -f1)
echo -e "${GREEN}✅ Archiwum utworzone: $ARCHIVE_NAME ($ARCHIVE_SIZE)${NC}"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Przygotowanie zakończone pomyślnie!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📤 Następne kroki:"
echo ""
echo "1️⃣  Prześlij archiwum na serwer Mikrus:"
echo -e "   ${YELLOW}scp $ARCHIVE_NAME twoja-nazwa@twoj-serwer.mikr.us:~/${NC}"
echo ""
echo "2️⃣  Zaloguj się na serwer:"
echo -e "   ${YELLOW}ssh twoja-nazwa@twoj-serwer.mikr.us${NC}"
echo ""
echo "3️⃣  Rozpakuj archiwum na serwerze:"
echo -e "   ${YELLOW}mkdir -p ~/apps/10x-flashcards${NC}"
echo -e "   ${YELLOW}cd ~/apps/10x-flashcards${NC}"
echo -e "   ${YELLOW}tar -xzf ~/${ARCHIVE_NAME##*/}${NC}"
echo ""
echo "4️⃣  Uruchom aplikację:"
echo -e "   ${YELLOW}pm2 start ecosystem.config.cjs${NC}"
echo -e "   ${YELLOW}pm2 save${NC}"
echo ""
echo "📖 Więcej informacji: MIKRUS-DEPLOYMENT.md"
echo ""


