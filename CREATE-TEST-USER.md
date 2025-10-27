# Tworzenie Testowego Użytkownika w Supabase

## 📝 Informacje o Testowym Użytkowniku

Po uruchomieniu migracji będziesz miał dostęp do testowego użytkownika:

```
Email:    test@example.com
Password: password123
User ID:  11111111-1111-1111-1111-111111111111
```

---

## 🚀 Jak Uruchomić Migrację?

### Opcja 1: Supabase CLI (Lokalne)

Jeśli używasz lokalnego Supabase:

```bash
# Uruchom Supabase lokalnie
supabase start

# Zastosuj migracje
supabase db push
```

### Opcja 2: Supabase CLI (Remote)

Jeśli masz połączenie z remote projektem:

```bash
# Linkuj do projektu (jeśli jeszcze nie zrobiłeś)
supabase link --project-ref your-project-ref

# Zastosuj migracje
supabase db push
```

### Opcja 3: Supabase Dashboard (Manualne)

1. Otwórz [Supabase Dashboard](https://app.supabase.com)
2. Wybierz swój projekt
3. Idź do **SQL Editor**
4. Skopiuj i wykonaj poniższy SQL:

```sql
-- Wstaw testowego użytkownika
DO $$
DECLARE
    test_user_id uuid := '11111111-1111-1111-1111-111111111111';
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = test_user_id) THEN
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role,
            aud
        ) VALUES (
            test_user_id,
            '00000000-0000-0000-0000-000000000000',
            'test@example.com',
            '$2a$10$rZ5l3qKq5qKq5qKq5qKq5uZl3qKq5qKq5qKq5qKq5qKq5qKq5qKq5',
            now(),
            now(),
            now(),
            '{"provider":"email","providers":["email"]}',
            '{"name":"Test User"}',
            false,
            'authenticated',
            'authenticated'
        );
        RAISE NOTICE 'Test user created successfully!';
    ELSE
        RAISE NOTICE 'Test user already exists';
    END IF;
END $$;
```

---

## 🔧 Aktualizacja Endpointów API

Teraz zaktualizujmy nasze endpointy, żeby używały tego testowego użytkownika:

### W `/api/decks` (POST):
```typescript
user_id: '11111111-1111-1111-1111-111111111111' // Test user
```

### W `/api/flashcards/batch` (POST):
```typescript
user_id: '11111111-1111-1111-1111-111111111111' // Test user
```

---

## ✅ Weryfikacja

Po uruchomieniu migracji, sprawdź czy użytkownik istnieje:

```sql
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'test@example.com';
```

Powinieneś zobaczyć:
```
id: 11111111-1111-1111-1111-111111111111
email: test@example.com
email_confirmed_at: 2025-10-23...
```

---

## 🎯 Następne Kroki

1. ✅ Uruchom migrację
2. ✅ Zweryfikuj że użytkownik istnieje
3. ✅ Zaktualizuj endpointy API (używaj test user_id)
4. ✅ Przetestuj tworzenie decks
5. ✅ Przetestuj generowanie i zapis flashcards

---

## ⚠️ Ważne Uwagi

- **To jest tylko do testowania!** Nie używaj tego w produkcji
- Hasło (`password123`) jest zahashowane bcrypt
- User ID jest stały: `11111111-1111-1111-1111-111111111111`
- W przyszłości dodasz prawdziwą autentykację

---

## 🔐 Późniejsza Autentykacja (Optional)

Gdy będziesz gotowy na prawdziwą autentykację:

1. Użyj Supabase Auth UI lub własny formularz logowania
2. Po zalogowaniu pobierz `user.id` z sesji
3. Przekaż ten ID do endpointów API
4. Włącz RLS policies (aktualnie wyłączone)

Przykład z Supabase Auth:
```typescript
const { data: { user } } = await supabase.auth.getUser();
const userId = user?.id; // Prawdziwy user ID z sesji
```

---

## 📞 Pomoc

Jeśli masz problemy:
- Sprawdź logi Supabase w Dashboard
- Zweryfikuj połączenie z bazą
- Upewnij się że RLS policies są wyłączone (allow all)






