# ⚡ Mikrus - Szybki Start (5 minut)

## 📋 Co potrzebujesz

- Dostęp SSH do serwera Mikrus
- Dane logowania (użytkownik@serwer.mikr.us)

---

## 🚀 Wdrożenie w 5 krokach

### 1️⃣ Przygotuj aplikację lokalnie (Windows)

```powershell
# Uruchom skrypt przygotowania
.\prepare-deployment.ps1
```

To utworzy archiwum ZIP w folderze `deployment/`

---

### 2️⃣ Prześlij pliki na serwer

**Opcja A: Przez WinSCP/FileZilla**
1. Otwórz WinSCP lub FileZilla
2. Połącz się z `twoj-serwer.mikr.us`
3. Prześlij plik ZIP z folderu `deployment/`

**Opcja B: Przez Git (ZALECANE)**
```powershell
# Commitnij zmiany (bez .env!)
git add .
git commit -m "Deployment ready"
git push
```

---

### 3️⃣ Zaloguj się na serwer Mikrus

```bash
ssh twoja-nazwa@twoj-serwer.mikr.us
```

---

### 4️⃣ Przygotuj serwer (tylko raz)

```bash
# Zainstaluj Node.js przez nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22

# Zainstaluj PM2
npm install -g pm2

# Zainstaluj Nginx (jeśli nie jest)
sudo apt update
sudo apt install nginx -y
```

---

### 5️⃣ Wdróż aplikację

**Jeśli używasz Git:**

```bash
# Sklonuj repo
cd ~
mkdir -p apps
cd apps
git clone https://github.com/twoje-repo/10x-project-barwy.git
cd 10x-project-barwy

# Zainstaluj zależności
npm ci --production=false

# ⚠️ WAŻNE: Utwórz .env PRZED buildem!
nano .env
# Wklej:
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_KEY=your-key
# OPENAI_API_KEY=sk-your-key
# NODE_ENV=production
# PORT=3000
# Zapisz: Ctrl+O, Enter, Ctrl+X

# Teraz zbuduj aplikację (z .env)
npm run build

# Uruchom przez PM2
pm2 start ecosystem.config.cjs
pm2 startup
pm2 save
```

**Jeśli używasz ZIP:**

```bash
# Utwórz folder
mkdir -p ~/apps/10x-flashcards
cd ~/apps/10x-flashcards

# Rozpakuj ZIP
unzip ~/10x-app-XXXXXX-XXXXXX.zip

# Zainstaluj zależności
npm ci --production

# Uruchom
pm2 start ecosystem.config.cjs
pm2 startup
pm2 save
```

---

### 6️⃣ Skonfiguruj Nginx

```bash
# Utwórz konfigurację
sudo nano /etc/nginx/sites-available/10x-flashcards
```

Wklej (zmień `twoja-domena.mikr.us`):

```nginx
server {
    listen 80;
    server_name twoja-domena.mikr.us;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktywuj:

```bash
sudo ln -s /etc/nginx/sites-available/10x-flashcards /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### 7️⃣ Włącz HTTPS (SSL)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d twoja-domena.mikr.us
```

---

## ✅ Gotowe!

Aplikacja działa na: `https://twoja-domena.mikr.us`

---

## 🔧 Przydatne komendy

### Sprawdzanie statusu

```bash
# Status PM2
pm2 status

# Logi aplikacji
pm2 logs 10x-flashcards

# Logi na żywo
pm2 logs 10x-flashcards --lines 100

# Monitorowanie zasobów
pm2 monit
```

### Zarządzanie aplikacją

```bash
# Restart
pm2 restart 10x-flashcards

# Stop
pm2 stop 10x-flashcards

# Start
pm2 start 10x-flashcards

# Lista procesów
pm2 list
```

### Aktualizacja aplikacji (przez Git)

```bash
cd ~/apps/10x-project-barwy
git pull
npm ci --production=false
npm run build
pm2 restart 10x-flashcards
```

### Sprawdzanie logów Nginx

```bash
# Logi błędów
sudo tail -f /var/log/nginx/error.log

# Logi dostępu
sudo tail -f /var/log/nginx/access.log
```

---

## 🐛 Szybkie rozwiązywanie problemów

### Aplikacja nie działa

```bash
# Sprawdź logi PM2
pm2 logs 10x-flashcards --lines 50

# Sprawdź czy port 3000 jest zajęty
netstat -tuln | grep 3000

# Restart aplikacji
pm2 restart 10x-flashcards
```

### 502 Bad Gateway

```bash
# Sprawdź czy aplikacja działa
pm2 status

# Sprawdź Nginx
sudo nginx -t
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx
```

### Brak pamięci

```bash
# Sprawdź użycie
free -h
df -h

# Zmniejsz liczbę instancji PM2
nano ecosystem.config.cjs
# Zmień: instances: 1 (zamiast 'max')
pm2 restart 10x-flashcards
```

---

## 📞 Pomoc

- **Dokumentacja pełna**: `MIKRUS-DEPLOYMENT.md`
- **Wiki Mikrus**: https://wiki.mikr.us/
- **Panel Mikrus**: https://mikr.us/panel/

---

## ⚠️ Ważne uwagi

### Supabase Configuration

Po wdrożeniu zaktualizuj w [Supabase Dashboard](https://app.supabase.com):

**Settings → Authentication → URL Configuration**
- Site URL: `https://twoja-domena.mikr.us`
- Redirect URLs: Dodaj `https://twoja-domena.mikr.us/**`

### Bezpieczeństwo

- ✅ NIGDY nie commituj pliku `.env` do Git
- ✅ Używaj HTTPS (certbot)
- ✅ Regularnie aktualizuj zależności: `npm audit`
- ✅ Monitoruj logi: `pm2 logs`

---

**Powodzenia! 🎉**


