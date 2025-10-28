# ✅ CI/CD Setup Checklist

Użyj tej checklisty żeby upewnić się, że wszystko jest poprawnie skonfigurowane.

---

## 📋 Pre-requisites

- [ ] Masz konto GitHub z dostępem do repozytorium
- [ ] Masz projekt Supabase (lub konto testowe)
- [ ] Projekt działa lokalnie (`npm run dev`)
- [ ] Testy przechodzą lokalnie (`npm run test:all`)

---

## 🔧 GitHub Configuration

### Secrets Setup

- [ ] **Dodano Secret: SUPABASE_URL**
  ```
  Settings > Secrets and variables > Actions > New repository secret
  Name: SUPABASE_URL
  Value: https://twoj-projekt.supabase.co
  ```

- [ ] **Dodano Secret: SUPABASE_ANON_KEY**
  ```
  Settings > Secrets and variables > Actions > New repository secret
  Name: SUPABASE_ANON_KEY  
  Value: twoj-anon-key-z-dashboardu
  ```

### Branch Protection (Opcjonalne ale Zalecane)

- [ ] **Włączono Branch Protection dla master/main**
  ```
  Settings > Branches > Add branch protection rule
  Branch name pattern: master (lub main)
  ```

- [ ] **Wymagane statusy przed mergem**
  ```
  ✓ Require status checks to pass before merging
  Status checks that are required:
    - lint
    - test-unit
    - test-e2e
    - build
  ```

- [ ] **Wymagane review przed mergem**
  ```
  ✓ Require a pull request before merging
  ✓ Require approvals: 1
  ```

---

## 📁 Files Verification

Sprawdź czy następujące pliki istnieją:

- [ ] `.github/workflows/ci.yml` - główny workflow
- [ ] `.github/workflows/README.md` - dokumentacja
- [ ] `.github/CI-CD-QUICK-START.md` - quick start guide
- [ ] `.github/SETUP-CHECKLIST.md` - ten plik
- [ ] `package.json` - zawiera wszystkie wymagane scripty
- [ ] `playwright.config.ts` - konfiguracja Playwright
- [ ] `vitest.config.ts` - konfiguracja Vitest

### Sprawdzenie Scripts w package.json

- [ ] `npm run lint` - działa
- [ ] `npm run test:run` - działa
- [ ] `npm run test:e2e` - działa
- [ ] `npm run build` - działa

---

## 🚀 First Run

### Test Manualny

- [ ] **Uruchomiono pipeline manualnie**
  ```
  GitHub > Actions > CI/CD Pipeline > Run workflow
  ```

- [ ] **Pipeline zakończył się sukcesem** (wszystkie joby ✅)
  - [ ] Lint passed
  - [ ] Unit Tests passed
  - [ ] E2E Tests passed
  - [ ] Build passed
  - [ ] Summary generated

- [ ] **Pobrano artifacts** (opcjonalne)
  - [ ] coverage-report
  - [ ] playwright-report
  - [ ] dist

### Test Automatyczny

- [ ] **Wykonano push na master**
  ```bash
  git add .
  git commit -m "test: verify CI/CD pipeline"
  git push origin master
  ```

- [ ] **Pipeline uruchomił się automatycznie**

- [ ] **Pipeline zakończył się sukcesem**

---

## 📊 Monitoring Setup (Opcjonalne)

### Status Badge

- [ ] **Dodano badge do README.md**
  ```markdown
  [![CI/CD](https://github.com/USER/REPO/actions/workflows/ci.yml/badge.svg)](https://github.com/USER/REPO/actions/workflows/ci.yml)
  ```

### Notifications (Opcjonalne)

- [ ] **Włączono email notifications**
  ```
  GitHub > Settings > Notifications > Actions
  ✓ Send notifications for failed workflows
  ```

- [ ] **Skonfigurowano Discord/Slack webhook** (jeśli używane)

---

## 🔍 Verification Tests

### Scenario 1: Failed Lint
- [ ] Wprowadzono błąd lintingu (np. nieużywaną zmienną)
- [ ] Push na master
- [ ] Pipeline failed na kroku "Lint"
- [ ] Pozostałe joby zostały pominięte (skipped)
- [ ] Naprawiono błąd
- [ ] Pipeline przeszedł

### Scenario 2: Failed Tests
- [ ] Wprowadzono breaking change w kodzie
- [ ] Push na master
- [ ] Pipeline failed na kroku "Unit Tests" lub "E2E Tests"
- [ ] Job "Build" został pominięty
- [ ] Naprawiono testy
- [ ] Pipeline przeszedł

### Scenario 3: Failed Build
- [ ] Wprowadzono błąd w buildzie (np. import nieistniejącego modułu)
- [ ] Testy przechodzą lokalnie
- [ ] Pipeline failed na kroku "Build"
- [ ] Naprawiono błąd
- [ ] Pipeline przeszedł

---

## 📈 Performance Baseline

Po pierwszym pomyślnym uruchomieniu, zapisz czasy wykonania:

| Job | Czas (min) | Status |
|-----|------------|--------|
| Lint | _________ | _____ |
| Unit Tests | _________ | _____ |
| E2E Tests | _________ | _____ |
| Build | _________ | _____ |
| **Total** | _________ | _____ |

**Oczekiwane czasy:**
- Lint: 0.5-1 min
- Unit Tests: 1-2 min
- E2E Tests: 2-3 min
- Build: 1-2 min
- **Total: 5-8 min**

Jeśli czasy znacząco przekraczają te wartości, możesz rozważyć optymalizację.

---

## 🎯 Success Criteria

Pipeline jest gotowy do produkcji jeśli:

- ✅ Wszystkie powyższe checklisty są zaznaczone
- ✅ Pipeline przechodzi automatycznie na master
- ✅ Pipeline przechodzi manualnie
- ✅ Artifacts są generowane poprawnie
- ✅ Czas wykonania jest akceptowalny (< 10 min)
- ✅ Team rozumie jak używać CI/CD
- ✅ Branch protection jest włączone

---

## 🔄 Maintenance

### Co miesiąc

- [ ] Sprawdź czy dependencies są aktualne
- [ ] Sprawdź czy Node version jest aktualna
- [ ] Sprawdź czy wykorzystanie GitHub Actions jest w limicie
- [ ] Sprawdź czy wszystkie Secrets są aktualne

### Co kwartał  

- [ ] Review czasu wykonania pipeline (czy można zoptymalizować?)
- [ ] Review artifacts retention (czy 7 dni jest OK?)
- [ ] Review branch protection rules (czy są aktualne?)

---

## 🆘 Rollback Plan

Jeśli coś pójdzie nie tak:

1. **Tymczasowo wyłącz pipeline:**
   - Zmień triggery w `.github/workflows/ci.yml` na `workflow_dispatch` only
   - Push zmianę

2. **Debuguj problem:**
   - Sprawdź logi z failed runs
   - Testuj lokalnie
   - Sprawdź czy Secrets są poprawne

3. **Przywróć gdy gotowe:**
   - Napraw problem
   - Dodaj z powrotem trigger `push` na master
   - Test manualnie przed pushm

---

## 📞 Contact

**CI/CD Maintainer:** [Twoje Imię]  
**Email:** [Twój Email]  
**Last Updated:** 2025-10-28

---

**Status:** 
- [ ] 🟡 In Progress - Setup rozpoczęty
- [ ] 🟢 Complete - Wszystko działa
- [ ] 🔴 Issues - Wymagana uwaga

---

**Notes:**
_Dodaj tutaj swoje notatki podczas setupu..._

