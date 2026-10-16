# LongDrive — pliki wymagające weryfikacji

**Żaden plik nie został usunięty ani oznaczony do automatycznego usunięcia.** Sama nazwa lub data pliku nie wystarcza do bezpiecznego usunięcia. Przed publikacją należy sprawdzić poniższe pozycje.

## Konfiguracja i backend — nie umieszczono w paczce

### Render

- `render.yaml` — GitHub opisuje usługi `longdrive-backend` i `longdrive-frontend` oraz uruchamia `node server.cjs`. Lokalny projekt zawiera inną konfigurację tego pliku. Użytkownik podaje, że aktywne usługi na Render to `longdrive-app` i `longdrive-api`. Nie mam dostępu do ich ustawień w panelu, więc nie zastępuję pliku ani nie zakładam, że zmiana Blueprint zaktualizuje istniejące usługi.
- `src/lib/runtimeConfig.js` jest w paczce i korzysta ze zmiennej `VITE_API_URL`; jej wartość w usłudze `longdrive-app` trzeba potwierdzić przed buildem frontendowym.
- `server/server.js` ogranicza dozwolone originy w trybie web do localhost. Przy osobnych domenach frontend/backend może to blokować połączenia CORS. Z kolei bieżący GitHubowy `server/server.cjs` zawiera `cors()` dla wszystkich originów i domyślny sekret JWT `your-secret-key-change-this`. Nie wolno wybrać pliku startowego bez sprawdzenia aktualnej konfiguracji usługi i bezpiecznego planu migracji.

### Backend / baza danych

Poniższe lokalne pliki różnią się od GitHuba i wymagają osobnego przeglądu przed ewentualną podmianą. Zmiany backendu mogą wpływać na istniejącą bazę i uwierzytelnianie:

- `server/controllers/authController.js`
- `server/controllers/driverController.js`
- `server/controllers/keyLogController.js`
- `server/controllers/serviceController.js`
- `server/controllers/tripController.js`
- `server/database.js`
- `server/models/CompanySettings.js`
- `server/models/Driver.js`
- `server/models/KeyLog.js`
- `server/models/Service.js`
- `server/models/Trip.js`
- `server/models/User.js`
- `server/models/Vehicle.js`
- `server/package.json`
- `server/package-lock.json`
- `server/routes/authRoutes.js`
- `server/routes/keyLogRoutes.js`
- `server/server.cjs`
- `server/server.js`
- `server/runtime.js` — nowy lokalny plik wymagany przez lokalny `server.js`.

Lokalny backend korzysta z SQLite (`DATABASE_PATH` lub domyślnie `server/longdrive.db`). Zmienna `DATABASE_URL` z lokalnego `render.yaml` nie jest używana w tym kodzie. Nie potwierdzono, czy działająca usługa Render korzysta z SQLite, PostgreSQL, dysku trwałego ani którego pliku startowego używa.

## Manifesty i pliki konfiguracyjne — dodatkowa decyzja

- `package.json` i `package-lock.json` — lokalny manifest dodaje Electron/`electron-builder` i skrypty desktopowe; GitHub ma dodatkową zależność `react-responsive`. Te pliki pominięto, bo aktualizacja desktopowa wymagałaby też sprawdzenia plików Electron i instalatora, a sam build Render potrzebuje innego zakresu.
- `.gitignore` — lokalny i GitHubowy wariant ignorują `.env` oraz `node_modules`, ale nie zabezpieczają regułą `*.db`. Ponadto plik bazy jest już śledzony w lokalnym indeksie Git; sama zmiana `.gitignore` nie przestanie go śledzić.
- `README.md` — obie wersje zawierają instrukcje Base44, które mogą nie opisywać obecnej architektury Render.
- `entities/CompanySettings.js`, `entities/Driver.js`, `entities/KeyLog.js`, `entities/Service.js`, `entities/Trip.js`, `entities/Vehicle.js` — różnią się, ale trzeba potwierdzić, czy nadal korzysta z nich aktywny przepływ Base44.

## GitHub-only — sprawdzić przed ewentualnym usunięciem

Te elementy istnieją na aktualnym GitHub `main`, ale nie występują w lokalnym katalogu źródłowym. Nie są automatycznie kasowane ani nadpisywane:

- `analyze.cjs`
- `changeAppName.js`
- `export-project.js`
- `output.txt` — około 48 MB; sprawdzić, czy to wyłącznie wygenerowany log/eksport, i czy nie zawiera potrzebnych informacji lub danych wrażliwych.
- `server/routes/Nowy Dokument tekstowy.txt`
- `src/components/ui/MentorCard.jsx`
- `src/components/ui/StatCardSTAXX.jsx`
- `src/pages/Dashboard — kopia.jsx`
- `zrzut.py`

## Pliki lokalne, których nie wolno publikować

- `.env` i `server/.env` — pozostały poza paczką. Ich zawartość nie była odczytywana ani kopiowana.
- `server/longdrive.db` — lokalna baza nie została skopiowana. Jest obecnie śledzona w lokalnym indeksie Git, dlatego przed jakimkolwiek `git add` trzeba zapobiec jej ponownemu dodaniu.
- GitHubowa historia pokazuje, że `server/longdrive.db` została dodana w pierwszym publicznym commicie, a usunięta z aktualnej gałęzi w późniejszym commicie. Usunięcie z aktualnego drzewa nie usuwa jej z historii Git. Nie odczytywano zawartości bazy; jeśli zawierała dane użytkowników lub sekrety, potraktuj je jako potencjalnie ujawnione i oceń potrzebę rotacji danych uwierzytelniających.
- Lokalny katalog `node_modules/` i artefakty `dist/`/`build/` nie są częścią paczki.

## Stan audytu

GitHub `main` miał 190 plików; porównanie SHA-1 obiektów Git wykazało 98 różniących się wspólnych plików, 9 plików obecnych wyłącznie na GitHubie i 83 pliki o identycznej zawartości. Lokalny `main` wskazuje commit `5603b5b`; GitHub `main` wskazuje `0009540` i jest o 95 commitów dalej. W lokalnym środowisku nie znaleziono wykonywalnego `git`, więc pełnego `git status`/stanu staged nie dało się potwierdzić. Nie wykonano żadnych operacji Git.

Nie było dostępu do panelu Render. Nazwy usług, ich komendy, zmienne środowiskowe, domeny i konfiguracja trwałego dysku wymagają ręcznego potwierdzenia.
