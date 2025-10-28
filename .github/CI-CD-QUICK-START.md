# 🚀 CI/CD Quick Start Guide

## Szybkie uruchomienie w 3 krokach

### 1️⃣ Skonfiguruj GitHub Secrets

Przejdź do: `Settings > Secrets and variables > Actions > New repository secret`

Dodaj dwa sekretne zmienne:

```
Name: SUPABASE_URL
Value: https://twoj-projekt.supabase.co
```

```
Name: SUPABASE_ANON_KEY  
Value: twój-anon-key
```

💡 **Gdzie znaleźć te wartości?**
- Zaloguj się do [Supabase Dashboard](https://supabase.com/dashboard)
- Wybierz swój projekt
- `Settings > API`
- Skopiuj **Project URL** i **anon public key**

⚠️ **Używasz lokalnego Supabase (Docker)?**
- Zobacz: [SUPABASE-CI-OPTIONS.md](SUPABASE-CI-OPTIONS.md)
- TL;DR: Stwórz dedykowany projekt testowy w cloud

---

### 2️⃣ Uruchom Pipeline Manualnie

1. Przejdź do zakładki **Actions** w GitHub
2. Wybierz **CI/CD Pipeline** z lewej strony
3. Kliknij **Run workflow** (prawy górny róg)
4. Wybierz branch (domyślnie: master)
5. Kliknij zielony przycisk **Run workflow**

⏱️ Pipeline powinien zakończyć się w **5-8 minut**

---

### 3️⃣ Sprawdź Wyniki

Po zakończeniu zobaczysz:
- ✅ Zielony checkmark - wszystko OK
- ❌ Czerwony krzyżyk - coś poszło nie tak

**Jak zobaczyć szczegóły?**
1. Kliknij na nazwę pipeline run
2. Zobacz status każdego kroku:
   - 🔍 Lint
   - 🧪 Unit Tests  
   - 🎭 E2E Tests
   - 🏗️ Build
   - 📋 Summary

**Gdzie są artifacts?**
- Scroll na dół strony z wynikami
- Sekcja **Artifacts** - pobierz:
  - `coverage-report` - pokrycie testami
  - `playwright-report` - raport z testów E2E
  - `dist` - zbudowana aplikacja

---

## 🔄 Automatyczne Uruchamianie

Pipeline uruchamia się automatycznie po każdym:
```bash
git push origin master
```

Możesz pracować na innych branchach bez uruchamiania CI:
```bash
git checkout -b feature/moja-funkcja
git push origin feature/moja-funkcja  # CI się nie uruchomi
```

---

## 🧪 Testowanie Lokalnie

Przed pushem sprawdź wszystko lokalnie:

```bash
# 1. Linting
npm run lint

# 2. Unit tests
npm run test:run

# 3. E2E tests  
npm run test:e2e

# 4. Build
npm run build
```

Jeśli wszystko przechodzi lokalnie, przejdzie też w CI! ✨

---

## ❌ Co zrobić gdy Pipeline Failed?

### Krok 1: Sprawdź który job failed
```
✅ Lint
❌ Unit Tests ← tutaj jest problem
⏭️ E2E Tests (skipped)
⏭️ Build (skipped)
```

### Krok 2: Zobacz logi
1. Kliknij na failed job (np. "Unit Tests")
2. Rozwiń step który pokazuje ❌
3. Przeczytaj error message

### Krok 3: Napraw lokalnie
```bash
# Dla Unit Tests
npm run test:run

# Dla E2E Tests  
npm run test:e2e

# Dla Lint
npm run lint:fix
```

### Krok 4: Push fix
```bash
git add .
git commit -m "fix: naprawiono testy"
git push origin master  # CI uruchomi się ponownie
```

---

## 📊 Status Badge

Dodaj badge do README.md żeby pokazać status CI:

```markdown
[![CI/CD Pipeline](https://github.com/USERNAME/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/USERNAME/REPO/actions/workflows/ci.yml)
```

Zamień `USERNAME` i `REPO` na swoje wartości.

---

## 🎯 Best Practices

### ✅ DO:
- Testuj lokalnie przed pushem
- Commituj małe zmiany często
- Sprawdzaj status CI przed mergem PR

### ❌ DON'T:
- Nie pushuj bez lokalnych testów
- Nie ignoruj failed CI
- Nie merge'uj gdy CI jest czerwony

---

## 🆘 Troubleshooting

### "SUPABASE_URL is not defined"
→ Sprawdź czy dodałeś Secrets w GitHub (krok 1)

### "Playwright test failed"
→ Upewnij się że serwer lokalny działa: `npm run dev`

### "Build failed"
→ Sprawdź czy wszystkie dependencies są w package.json

### "Node version mismatch"
→ Pipeline używa Node 20 LTS - zaktualizuj lokalnie

---

## 📞 Potrzebujesz Pomocy?

1. Sprawdź pełną dokumentację: `.github/workflows/README.md`
2. Zobacz przykładowe logi w Actions
3. Sprawdź [GitHub Actions Docs](https://docs.github.com/en/actions)

---

**Gotowe!** 🎉 Twój CI/CD jest już skonfigurowany i gotowy do użycia.

Następny push na master automatycznie uruchomi cały pipeline.

