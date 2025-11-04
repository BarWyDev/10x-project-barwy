# 🚀 Wdrożenie Aplikacji na Serwer Mikrus

## 📋 Wymagania

### Na Twoim serwerze Mikrus:
- Node.js v22.x (LTS)
- npm lub pnpm
- PM2 (menedżer procesów Node.js)
- Nginx (jako reverse proxy)
- Git (do pobierania kodu)

---

## 🎯 Krok 1: Przygotowanie Aplikacji Lokalnie (Opcjonalne)

**Uwaga**: Ten krok jest opcjonalny. Zalecane jest budowanie aplikacji bezpośrednio na serwerze (Metoda A w Kroku 3), ponieważ:
- Build będzie miał dostęp do właściwych zmiennych środowiskowych
- Unikniesz problemów z różnicami między środowiskami

Jeśli jednak chcesz zbudować lokalnie i przesłać gotową aplikację:

### 1.1 Przygotuj zmienne środowiskowe lokalnie

Utwórz plik `.env` lokalnie (dla testów):

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# OpenAI API (lub OpenRouter)
OPENAI_API_KEY=sk-your-key

# Node Environment
NODE_ENV=production
HOST=0.0.0.0
PORT=3000
```

**⚠️ WAŻNE**: Nigdy nie commituj tego pliku do repozytorium!

### 1.2 Zbuduj aplikację lokalnie

```bash
# Zainstaluj zależności (jeśli jeszcze nie zrobiłeś)
npm install

# Zbuduj aplikację produkcyjną (z .env)
npm run build
```

To utworzy folder `dist/` z gotową aplikacją.

---

## 🖥️ Krok 2: Przygotowanie Serwera Mikrus

### 2.1 Zaloguj się do serwera przez SSH

```bash
ssh twoja-nazwa@twoj-serwer.mikr.us
```

### 2.2 Zainstaluj Node.js (jeśli nie jest zainstalowany)

```bash
# Sprawdź czy Node.js jest zainstalowany
node --version

# Jeśli nie, zainstaluj przez nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Załaduj nvm
source ~/.bashrc

# Zainstaluj Node.js 22
nvm install 22
nvm use 22
nvm alias default 22
```

### 2.3 Zainstaluj PM2 (menedżer procesów)

```bash
npm install -g pm2
```

---

## 📦 Krok 3: Wgranie Aplikacji na Serwer

### Metoda A: Przez Git (ZALECANE)

```bash
# Na serwerze
cd ~
mkdir -p apps
cd apps

# Sklonuj repozytorium
git clone https://github.com/twoje-repo/10x-project-barwy.git
cd 10x-project-barwy

# Zainstaluj zależności produkcyjne
npm ci --production=false
```

**⚠️ WAŻNE**: NIE buduj jeszcze aplikacji! Najpierw utwórz plik `.env` (Krok 4).

### Metoda B: Przez SFTP/FTP

1. **Lokalnie**: Spakuj pliki:
```bash
# Spakuj tylko niezbędne pliki (BEZ folderu dist!)
tar -czf app.tar.gz package.json package-lock.json src/ public/ astro.config.mjs tsconfig.json
```

2. **Prześlij przez SFTP**:
```bash
# Użyj WinSCP, FileZilla lub sftp w terminalu
sftp twoja-nazwa@twoj-serwer.mikr.us
put app.tar.gz
```

3. **Na serwerze**: Rozpakuj i zainstaluj:
```bash
cd ~/apps
mkdir 10x-project-barwy
cd 10x-project-barwy
tar -xzf ~/app.tar.gz
npm ci --production=false
```

---

## ⚙️ Krok 4: Konfiguracja i Build

### 4.1 Utwórz plik `.env` na serwerze (NAJPIERW!)

**⚠️ WAŻNE**: Musisz utworzyć plik `.env` PRZED budowaniem aplikacji, ponieważ Astro wkompilowuje zmienne środowiskowe podczas buildu!

```bash
cd ~/apps/10x-project-barwy
nano .env
```

Wklej zawartość (dostosuj do swoich danych):

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
OPENAI_API_KEY=sk-your-openai-key-here
NODE_ENV=production
HOST=0.0.0.0
PORT=3000
```

Zapisz: `Ctrl+O`, `Enter`, `Ctrl+X`

### 4.2 Zbuduj aplikację (z plikiem .env)

Teraz, gdy plik `.env` jest na miejscu, możesz zbudować aplikację:

```bash
npm run build
```

To utworzy folder `dist/` ze zbudowaną aplikacją, która ma już wkompilowane zmienne środowiskowe.

### 4.3 Utwórz plik konfiguracyjny PM2

```bash
nano ecosystem.config.cjs
```

Wklej:

```javascript
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
```

**Uwaga**: Używamy rozszerzenia `.cjs` bo projekt ma `"type": "module"` w `package.json`.

### 4.4 Utwórz folder na logi

```bash
mkdir -p logs
```

---

## 🚀 Krok 5: Uruchomienie Aplikacji

### 5.1 Uruchom aplikację przez PM2

```bash
# Uruchom aplikację
pm2 start ecosystem.config.cjs

# Sprawdź status
pm2 status

# Zobacz logi
pm2 logs 10x-flashcards

# Ustaw autostart po restarcie serwera
pm2 startup
pm2 save
```

### 5.2 Testuj czy aplikacja działa

```bash
# Sprawdź czy aplikacja odpowiada
curl http://localhost:3000

# Jeśli działa, zobaczysz HTML strony
```

---

## 🌐 Krok 6: Konfiguracja Nginx (Reverse Proxy)

### 6.1 Zainstaluj Nginx (jeśli nie jest zainstalowany)

```bash
sudo apt update
sudo apt install nginx
```

### 6.2 Utwórz konfigurację dla swojej domeny

```bash
sudo nano /etc/nginx/sites-available/10x-flashcards
```

Wklej (dostosuj domenę):

```nginx
server {
    listen 80;
    server_name twoja-domena.mikr.us;  # Lub twoja własna domena

    # Logi
    access_log /var/log/nginx/10x-flashcards-access.log;
    error_log /var/log/nginx/10x-flashcards-error.log;

    # Główna lokalizacja - proxy do Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Zwiększ timeout dla długich requestów (AI generation)
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;

    # Maksymalny rozmiar uploadu
    client_max_body_size 10M;
}
```

### 6.3 Aktywuj konfigurację

```bash
# Utwórz symlink
sudo ln -s /etc/nginx/sites-available/10x-flashcards /etc/nginx/sites-enabled/

# Testuj konfigurację
sudo nginx -t

# Przeładuj Nginx
sudo systemctl reload nginx
```

---

## 🔒 Krok 7: SSL/HTTPS (Opcjonalnie, ale zalecane)

### 7.1 Zainstaluj Certbot (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
```

### 7.2 Uzyskaj certyfikat SSL

```bash
sudo certbot --nginx -d twoja-domena.mikr.us
```

Postępuj według instrukcji. Certbot automatycznie skonfiguruje HTTPS.

---

## 📊 Krok 8: Zarządzanie Aplikacją

### Przydatne komendy PM2

```bash
# Status wszystkich aplikacji
pm2 status

# Logi na żywo
pm2 logs 10x-flashcards

# Restart aplikacji
pm2 restart 10x-flashcards

# Stop aplikacji
pm2 stop 10x-flashcards

# Usuń z PM2
pm2 delete 10x-flashcards

# Monitorowanie zasobów
pm2 monit
```

### Aktualizacja aplikacji

```bash
# Przez Git
cd ~/apps/10x-project-barwy
git pull
npm ci --production=false
npm run build
pm2 restart 10x-flashcards

# Lub przez SFTP
# 1. Prześlij nowe pliki
# 2. Rozpakuj
# 3. pm2 restart 10x-flashcards
```

---

## 🐛 Troubleshooting

### Problem: Aplikacja nie startuje

```bash
# Sprawdź logi PM2
pm2 logs 10x-flashcards --lines 100

# Sprawdź czy port 3000 jest wolny
netstat -tuln | grep 3000

# Sprawdź zmienne środowiskowe
pm2 env 0  # (0 to ID procesu, zobacz w pm2 status)
```

### Problem: 502 Bad Gateway w przeglądarce

```bash
# Sprawdź czy aplikacja Node.js działa
pm2 status

# Sprawdź logi Nginx
sudo tail -f /var/log/nginx/10x-flashcards-error.log

# Sprawdź konfigurację Nginx
sudo nginx -t
```

### Problem: Brak połączenia z Supabase

```bash
# Sprawdź zmienne środowiskowe w PM2
pm2 env 0

# Sprawdź plik .env
cat .env

# Testuj połączenie
curl https://your-project.supabase.co/rest/v1/
```

**Jeśli PM2 widzi zmienne, ale aplikacja pokazuje błąd "Supabase client requires URL and Key":**

To znaczy, że aplikacja została zbudowana BEZ pliku `.env`. Astro wkompilowuje zmienne podczas buildu.

**Rozwiązanie:**
```bash
# Upewnij się że .env istnieje
cat .env

# Przebuduj aplikację
npm run build

# Restart PM2
pm2 restart 10x-flashcards
```

### Problem: Brak pamięci

```bash
# Sprawdź użycie pamięci
free -h
pm2 monit

# Zmniejsz liczbę instancji w ecosystem.config.cjs
# instances: 1  (zamiast 'max')
```

---

## 📝 Checklist przed produkcją

- [ ] Node.js, npm, PM2 zainstalowane na serwerze
- [ ] Kod aplikacji wgrany na serwer (przez Git lub SFTP)
- [ ] Zależności zainstalowane (`npm ci --production=false`)
- [ ] **Plik `.env` utworzony z poprawnymi kluczami API** ⚠️ KLUCZOWE!
- [ ] **Aplikacja zbudowana NA SERWERZE** (`npm run build`) ⚠️ KOLEJNOŚĆ MA ZNACZENIE!
- [ ] Plik `ecosystem.config.cjs` utworzony
- [ ] PM2 skonfigurowany i działa (`pm2 start ecosystem.config.cjs`)
- [ ] PM2 autostart włączony (`pm2 startup`, `pm2 save`)
- [ ] Test lokalny działa (`curl http://localhost:3000`)
- [ ] Nginx skonfigurowany jako reverse proxy
- [ ] SSL/HTTPS włączony (Certbot)
- [ ] Domena wskazuje na serwer
- [ ] Supabase URL Configuration zaktualizowany (Site URL + Redirect URLs)
- [ ] Testy końcowe aplikacji wykonane przez przeglądarkę
- [ ] Monitoring logów włączony (`pm2 logs`)

---

## 🔧 Supabase: Aktualizacja URL Configuration

**WAŻNE**: Po wdrożeniu zaktualizuj konfigurację w Supabase Dashboard:

1. Przejdź do: [Supabase Dashboard](https://app.supabase.com) → Twój projekt → **Settings** → **Authentication** → **URL Configuration**

2. Ustaw:
   - **Site URL**: `https://twoja-domena.mikr.us`
   - **Redirect URLs**: Dodaj:
     - `https://twoja-domena.mikr.us/**`
     - `http://localhost:3000/**` (dla local dev)

---

## 📚 Dodatkowe Zasoby

### Dokumentacja Mikrus
- [Wiki Mikrus](https://wiki.mikr.us/)
- [Panel Mikrus](https://mikr.us/panel/)

### Pomocne linki
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Node.js Deployment Best Practices](https://github.com/goldbergyoni/nodebestpractices#6-going-to-production-practices)

---

## ❓ Pomoc

Jeśli masz problemy:

1. Sprawdź logi PM2: `pm2 logs`
2. Sprawdź logi Nginx: `sudo tail -f /var/log/nginx/error.log`
3. Sprawdź status procesów: `pm2 status`
4. Sprawdź czy porty są otwarte: `netstat -tuln`

---

## 📞 Kontakt z supportem Mikrus

- Panel: https://mikr.us/panel/
- FAQ: https://wiki.mikr.us/
- Email: support@mikr.us

---

**Powodzenia! 🚀**


