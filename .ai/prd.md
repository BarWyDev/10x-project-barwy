# Dokument wymagań produktu (PRD) - 10XCards

## 1. Przegląd produktu

10XCards to aplikacja internetowa zaprojektowana w celu  tworzenia fiszek edukacyjnych dla studentów. Wykorzystując model AI (LLM poprzez API), aplikacja automatyzuje generowanie fiszek na podstawie notatek wklejonych przez użytkownika, znacząco skracając czas potrzebny na przygotowanie materiałów do nauki. Kluczowym priorytetem produktu jest szybkość i płynność procesu, od wklejenia tekstu do otrzymania gotowych do nauki fiszek. Oprócz generowania przez AI, użytkownicy mają możliwość manualnego tworzenia i pełnego zarządzania swoimi zbiorami fiszek, które są zintegrowane z prostym algorytmem powtórek interwałowych (spaced repetition).

## 2. Problem użytkownika

Głównym problemem, który rozwiązuje 10XCards, jest czasochłonność i wysiłek związany z ręcznym tworzeniem wysokiej jakości fiszek. Studenci, dysponujący obszernymi notatkami z wykładów i materiałami źródłowymi, często rezygnują z efektywnej metody nauki, jaką są powtórki interwałowe, ze względu na barierę początkową, jaką jest przygotowanie fiszek. Proces ten jest postrzegany jako żmudny i zniechęcający, co prowadzi do wyboru mniej skutecznych technik zapamiętywania. 10XCards eliminuje tę barierę, automatyzując najbardziej pracochłonną część procesu i pozwalając studentom skupić się na nauce.

## 3. Wymagania funkcjonalne

- FR-01: System kont użytkowników: Użytkownicy muszą mieć możliwość rejestracji i logowania za pomocą adresu e-mail i hasła w celu bezpiecznego przechowywania i dostępu do swoich fiszek.
- FR-02: Generowanie fiszek przez AI: Aplikacja musi umożliwiać użytkownikom wklejenie tekstu, na podstawie którego model LLM wygeneruje propozycje fiszek (awers do 200 znaków, rewers do 500 znaków).
- FR-03: Weryfikacja i edycja propozycji: Użytkownik musi mieć możliwość przeglądania, edytowania i usuwania pojedynczych propozycji fiszek wygenerowanych przez AI przed ich ostatecznym zapisaniem.
- FR-04: Manualne tworzenie fiszek: Aplikacja musi zapewniać prosty edytor (obsługujący wyłącznie czysty tekst) do ręcznego tworzenia fiszek.
- FR-05: Zarządzanie fiszkami (CRUD): Użytkownicy muszą mieć możliwość przeglądania listy swoich fiszek, edytowania ich zawartości oraz trwałego usuwania.
- FR-06: System powtórek: Aplikacja musi być zintegrowana z gotowym, prostym algorytmem open-source typu spaced repetition, który będzie zarządzał datami kolejnych powtórek dla każdej fiszki.
- FR-07: Śledzenie metody tworzenia: Każda fiszka w bazie danych musi posiadać atrybut `creation_method` o wartości `ai` lub `manual`, aby umożliwić pomiar metryk sukcesu.
- FR-08: Limity użycia AI: System musi posiadać łatwo konfigurowalny limit liczby fiszek, które mogą być wygenerowane przez AI dla pojedynczego użytkownika.

## 4. Granice produktu

Następujące funkcjonalności świadomie nie wchodzą w zakres MVP (Minimum Viable Product):

- Zaawansowany, autorski algorytm powtórek w stylu SuperMemo czy Anki.
- Import fiszek z zewnętrznych formatów plików (np. PDF, DOCX, CSV).
- Funkcje społecznościowe, takie jak współdzielenie talii fiszek między użytkownikami.
- Integracje z zewnętrznymi platformami edukacyjnymi (np. Moodle, Canvas).
- Dedykowane aplikacje mobilne na systemy iOS i Android.
- Możliwość tworzenia i zarządzania zestawami fiszek (taliami).
- Rozbudowany proces onboardingu i samouczki dla nowych użytkowników.

## 5. Historyjki użytkowników

### Autoryzacja i Zarządzanie Kontem

- ID: US-001
- Tytuł: Rejestracja nowego konta użytkownika
- Opis: Jako nowy użytkownik, chcę móc założyć konto za pomocą adresu e-mail i hasła, aby bezpiecznie przechowywać moje fiszki.
- Kryteria akceptacji:
  1. Użytkownik może wprowadzić adres e-mail i hasło w formularzu rejestracji.
  2. System waliduje, czy e-mail ma poprawny format i czy hasło spełnia minimalne wymagania bezpieczeństwa.
  3. System sprawdza, czy konto z podanym adresem e-mail już nie istnieje.
  4. Po pomyślnej rejestracji, użytkownik jest automatycznie zalogowany i przekierowany do panelu głównego.
  5. W przypadku błędu (np. e-mail już istnieje) wyświetlany jest zrozumiały komunikat.

- ID: US-002
- Tytuł: Logowanie na istniejące konto
- Opis: Jako powracający użytkownik, chcę móc zalogować się na swoje konto przy użyciu e-maila i hasła, aby uzyskać dostęp do moich fiszek.
- Kryteria akceptacji:
  1. Użytkownik może wprowadzić e-mail i hasło w formularzu logowania.
  2. Po pomyślnym zalogowaniu, użytkownik jest przekierowany do panelu głównego.
  3. W przypadku podania błędnych danych uwierzytelniających, wyświetlany jest zrozumiały komunikat o błędzie.

- ID: US-003
- Tytuł: Wylogowanie z systemu
- Opis: Jako zalogowany użytkownik, chcę móc się wylogować, aby zabezpieczyć swoje konto.
- Kryteria akceptacji:
  1. W interfejsie użytkownika jest dostępna opcja "Wyloguj".
  2. Po jej użyciu sesja użytkownika jest kończona, a użytkownik jest przekierowywany na stronę logowania.

### Tworzenie Fiszek

- ID: US-004
- Tytuł: Generowanie fiszek na podstawie tekstu
- Opis: Jako student, chcę wkleić notatki z wykładu i zainicjować proces generowania, aby aplikacja automatycznie stworzyła dla mnie propozycje fiszek.
- Kryteria akceptacji:
  1. W interfejsie znajduje się pole tekstowe do wklejenia treści.
  2. Po kliknięciu przycisku "Generuj", system wysyła zapytanie do modelu AI i wyświetla wskaźnik ładowania.
  3. Po zakończeniu generowania, użytkownikowi wyświetlana jest lista proponowanych fiszek do weryfikacji.

- ID: US-005
- Tytuł: Weryfikacja i edycja wygenerowanych fiszek
- Opis: Jako student, chcę przejrzeć i edytować wygenerowane przez AI fiszki przed ich zapisaniem, aby upewnić się, że są poprawne.
- Kryteria akceptacji:
  1. Użytkownik może edytować zawartość awersu i rewersu każdej proponowanej fiszki.
  2. Użytkownik może usunąć pojedyncze propozycje fiszek z listy przed zapisaniem.
  3. Po edycji i weryfikacji, użytkownik może zapisać wszystkie fiszki jednym kliknięciem.
  4. Zapisane fiszki otrzymują w bazie danych atrybut `creation_method: ai`.

- ID: US-006
- Tytuł: Obsługa błędu generowania fiszek przez AI
- Opis: Jako użytkownik, chcę otrzymać jasny komunikat, jeśli AI nie będzie w stanie wygenerować fiszek z podanego przeze mnie tekstu.
- Kryteria akceptacji:
  1. Jeśli model AI zwróci błąd lub nie wygeneruje żadnych fiszek, użytkownik zobaczy komunikat wyjaśniający problem (np. "Nie udało się wyodrębnić informacji. Spróbuj z innym fragmentem tekstu.").
  2. Aplikacja pozostaje stabilna i pozwala na ponowną próbę.

- ID: US-007
- Tytuł: Osiągnięcie limitu generowania fiszek
- Opis: Jako użytkownik, chcę być poinformowany, gdy osiągnę limit liczby fiszek, które mogę wygenerować przy użyciu AI.
- Kryteria akceptacji:
  1. Przed próbą generowania system sprawdza, czy użytkownik nie przekroczył swojego limitu.
  2. Jeśli limit został osiągnięty, przycisk "Generuj" jest nieaktywny lub po kliknięciu wyświetla się komunikat informujący o limicie.

- ID: US-008
- Tytuł: Ręczne tworzenie nowej fiszki
- Opis: Jako użytkownik, chcę mieć możliwość ręcznego dodania pojedynczej fiszki, gdy mam konkretną informację do zapamiętania.
- Kryteria akceptacji:
  1. W interfejsie dostępny jest przycisk "Dodaj nową fiszkę".
  2. Po kliknięciu pojawia się formularz z polami na awers i rewers (czysty tekst).
  3. Po wypełnieniu i zapisaniu, nowa fiszka jest dodawana do listy użytkownika z atrybutem `creation_method: manual`.

### Zarządzanie Fiszkami i Nauka

- ID: US-009
- Tytuł: Przeglądanie listy posiadanych fiszek
- Opis: Jako użytkownik, chcę widzieć listę wszystkich moich fiszek, aby mieć ogólny pogląd na moje materiały do nauki.
- Kryteria akceptacji:
  1. Po zalogowaniu, użytkownik widzi listę wszystkich swoich zapisanych fiszek.
  2. Każdy element listy wyświetla przynajmniej treść awersu.
  3. Lista jest paginowana lub przewijalna, jeśli zawiera dużą liczbę fiszek.

- ID: US-010
- Tytuł: Edycja istniejącej fiszki
- Opis: Jako użytkownik, chcę móc edytować treść moich wcześniej zapisanych fiszek, aby poprawić błędy lub zaktualizować informacje.
- Kryteria akceptacji:
  1. Przy każdej fiszce na liście znajduje się opcja "Edytuj".
  2. Po jej wybraniu, użytkownik może zmodyfikować zawartość awersu i rewersu.
  3. Zapisane zmiany są trwale odzwierciedlone w bazie danych.

- ID: US-011
- Tytuł: Usuwanie fiszki
- Opis: Jako użytkownik, chcę móc usunąć fiszkę, której już nie potrzebuję, aby utrzymać porządek w moich materiałach.
- Kryteria akceptacji:
  1. Przy każdej fiszce na liście znajduje się opcja "Usuń".
  2. System prosi o potwierdzenie operacji usunięcia, aby zapobiec przypadkowym działaniom.
  3. Po potwierdzeniu, fiszka jest trwale usuwana z bazy danych.

- ID: US-012
- Tytuł: Rozpoczęcie sesji nauki
- Opis: Jako student, chcę rozpocząć sesję powtórkową, aby system zaprezentował mi fiszki, które wymagają nauki w danym dniu.
- Kryteria akceptacji:
  1. W interfejsie znajduje się przycisk "Rozpocznij naukę".
  2. Po kliknięciu, system, bazując na algorytmie powtórek, wybiera fiszki, których termin powtórki przypada na dziś (lub minął).
  3. Użytkownikowi prezentowana jest pierwsza fiszka z sesji (tylko awers).

- ID: US-013
- Tytuł: Ocenianie fiszek podczas nauki
- Opis: Jako student, podczas sesji nauki chcę ocenić, jak dobrze pamiętam daną fiszkę, aby algorytm mógł zaplanować jej kolejną powtórkę.
- Kryteria akceptacji:
  1. Po wyświetleniu awersu, użytkownik może odkryć rewers fiszki.
  2. Po odkryciu rewersu, dostępne są przyciski oceny (np. "Trudne", "Dobre", "Łatwe").
  3. Na podstawie wybranej oceny, algorytm oblicza i zapisuje nową datę następnej powtórki dla tej fiszki.
  4. System automatycznie przechodzi do następnej fiszki w sesji.

## 6. Metryki sukcesu

Kluczowe wskaźniki efektywności (KPIs) dla MVP zostaną zdefiniowane w celu pomiaru realizacji głównych celów produktu.

1. Jakość generacji AI
   - Metryka: Procent zaakceptowanych fiszek wygenerowanych przez AI.
   - Cel: 75%
   - Sposób pomiaru: Stosunek liczby fiszek zapisanych przez użytkownika (nawet po edycji) z atrybutem `creation_method: ai` do całkowitej liczby propozycji fiszek przedstawionych użytkownikowi przez AI. Każda zapisana fiszka jest liczona jako "zaakceptowana".

2. Adopcja funkcji AI
   - Metryka: Procent fiszek stworzonych przy użyciu AI w stosunku do wszystkich fiszek w systemie.
   - Cel: 75%
   - Sposób pomiaru: Stosunek liczby fiszek w całej bazie danych z atrybutem `creation_method: ai` do całkowitej liczby fiszek (`ai` + `manual`).
