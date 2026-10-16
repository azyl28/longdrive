# LongDrive — paczka aktualizacji GitHub

## Zakres paczki

Paczka zawiera **72 pliki źródłowe frontendu i konfiguracji jego budowania**:

- 60 plików `src/` zaktualizowanych względem `main`;
- 4 brakujące w GitHubie moduły `src/lib/`, importowane przez aktualne komponenty;
- 8 plików konfiguracji aplikacji i jej zasobów webowych.

Każdy plik źródłowy porównano z zawartością gałęzi GitHub `main`. Skopiowane kopie mają zgodne sumy SHA-256 z lokalnymi oryginałami. Oryginalny projekt nie został zmodyfikowany.

## Pliki dodawane

| Ścieżka | Uzasadnienie |
|---|---|
| `src/lib/colorUtils.js` | Brakujący moduł używany przez layout i ustawienia wyglądu. |
| `src/lib/documentPdf.js` | Brakujący generator używany przez widoki dokumentów PDF. |
| `src/lib/runtimeConfig.js` | Brakująca konfiguracja adresu API importowana przez `src/api/apiClient.js`. |
| `src/lib/tripCalculations.js` | Brakujące współdzielone obliczenia używane przez podróże i kartę drogową. |

## Pliki aktualizowane

Poniższe pliki zawierają wersję z lokalnego projektu; ścieżki są względne względem głównego katalogu repozytorium.

### Frontend i logika GPS

`src/api/apiClient.js`, `src/App.jsx`, `src/Layout.jsx`, `src/index.css`, `src/utils/index.ts`

`src/components/calendar/CalendarWidget.jsx`, `src/components/ConfirmModal.jsx`, `src/components/forms/TripStartForm.jsx`, `src/components/UserNotRegisteredError.jsx`, `src/components/weather/WeatherWidget.jsx`

`src/components/maps/GPSLiveTracker.jsx`, `src/components/maps/LocationSearch.jsx`, `src/components/maps/MapControls.jsx`, `src/components/maps/MapView.jsx`, `src/components/maps/MapWidget.jsx`, `src/components/maps/RoutePlanner.jsx`, `src/components/maps/TrackedTripsList.jsx`, `src/components/maps/TripDetailsModal.jsx`, `src/components/maps/TripHistoryMap.jsx`

`src/components/print/KartaDrogowa.jsx`, `src/components/print/PolecenieWyjazdu.jsx`, `src/components/trips/TripCardPDF.jsx`

`src/components/ui/alert.jsx`, `src/components/ui/badge.jsx`, `src/components/ui/button.jsx`, `src/components/ui/card.jsx`, `src/components/ui/dialog.jsx`, `src/components/ui/FormError.jsx`, `src/components/ui/GlassCard.jsx`, `src/components/ui/input.jsx`, `src/components/ui/Modal.jsx`, `src/components/ui/PageHeader.jsx`, `src/components/ui/SearchBar.jsx`, `src/components/ui/select.jsx`, `src/components/ui/skeleton.jsx`, `src/components/ui/SortButton.jsx`, `src/components/ui/StatCard.jsx`, `src/components/ui/table.jsx`, `src/components/ui/textarea.jsx`, `src/components/ui/toast.jsx`

`src/lib/calendarUtils.js`, `src/lib/PageNotFound.jsx`, `src/lib/query-client.js`, `src/lib/ThemeContext.jsx`, `src/lib/utils.js`, `src/lib/validation.js`, `src/lib/weatherApi.js`

`src/pages/Dashboard.jsx`, `src/pages/Drivers.jsx`, `src/pages/Keys.jsx`, `src/pages/LoginPage.jsx`, `src/pages/MapPage.jsx`, `src/pages/Refueling.jsx`, `src/pages/Services.jsx`, `src/pages/Settings.jsx`, `src/pages/Statistics.jsx`, `src/pages/TripDetail.jsx`, `src/pages/Trips.jsx`, `src/pages/Vehicles.jsx`, `src/pages/WeatherPage.jsx`

Reason: these files contain local frontend changes since the GitHub version. In particular, `MapPage.jsx` and `MapView.jsx` implement continuous GPS recording and drawing; `Trips.jsx` receives a completed GPS-track draft in the existing trip form without replacing odometer-based calculations. Shared layout, settings, maps, trip, and print components are included so the frontend sources are synchronized together.

### Frontend build and web resources

| Ścieżka | Uzasadnienie |
|---|---|
| `components.json` | Aktualna konfiguracja komponentów UI. |
| `eslint.config.js` | Aktualne reguły analizy kodu. |
| `index.html` | Aktualny punkt wejścia aplikacji webowej. |
| `jsconfig.json` | Aktualne aliasy i ustawienia rozwiązywania modułów. |
| `postcss.config.js` | Aktualna konfiguracja przetwarzania CSS. |
| `public/manifest.json` | Aktualne metadane aplikacji webowej. |
| `tailwind.config.js` | Aktualny motyw i skanowane ścieżki UI. |
| `vite.config.js` | Aktualna konfiguracja Vite i aliasu `@`. |

## Pliki celowo niewłączone

Nie skopiowano konfiguracji usług Render, kodu backendu, plików manifestów zależności ani bazy danych. Ich bezpieczna aktualizacja wymaga potwierdzenia rzeczywistych ustawień usług `longdrive-app` i `longdrive-api`, sposobu uruchamiania backendu, publicznego adresu API i trwałości bazy. Szczegóły są w `FILES_TO_REVIEW_FOR_DELETION.md`.

Nie skopiowano `node_modules/`, `.env`, `server/.env`, baz danych, `dist/`, `build/`, plików Electron ani instalatora Windows. Repozytorium i usługi Render nie powinny otrzymać lokalnych sekretów ani danych użytkowników.

Lokalny frontend odczytuje publiczny adres API z `VITE_API_URL`, ale jego awaryjny adres to `http://127.0.0.1:5000/api`. Przed wdrożeniem trzeba sprawdzić, czy zmienna `VITE_API_URL` w usłudze `longdrive-app` wskazuje aktualną usługę `longdrive-api`.

## Jak przenieść pliki

Po zatwierdzeniu zmian:

1. Wykonaj kopię repozytorium i sprawdź jego stan Git; nie wykonuj `git reset`, nie nadpisuj lokalnych zmian.
2. Skopiuj do głównego katalogu repozytorium **wyłącznie wymienione wyżej pliki źródłowe** z zachowaniem ścieżek względnych. Na przykład `src/pages/MapPage.jsx` ma zastąpić `src/pages/MapPage.jsx` w klonie repozytorium.
3. Nie kopiuj plików `README_UPDATE.md` ani `FILES_TO_REVIEW_FOR_DELETION.md` do repozytorium aplikacji, chyba że chcesz zachować te raporty jako dokumentację.
4. Sprawdź `git status` i `git diff`; upewnij się, że nie są dodane `.env`, baza danych ani artefakty builda.
5. Uruchom instalację zależności i build frontendu w klonie repozytorium. Sprawdź w szczególności moduły wymienione w sekcji „Pliki dodawane”.
6. Przed publikacją sprawdź w panelu Render adres `VITE_API_URL`, komendę startową backendu, CORS, wymagane zmienne środowiskowe i trwały zapis bazy.
7. Dopiero po tych kontrolach zatwierdź i opublikuj zmiany. Ta paczka niczego nie wysyła na GitHub i nie uruchamia wdrożenia.

## Kontrole niewykonane

Nie uruchomiono builda tej paczki: nie zawiera ona własnego `package.json` ani `node_modules`, a oryginalny projekt pozostał nietknięty. Nie wykonano testu połączenia z Render, migracji bazy, testu wdrożenia ani rzeczywistego przejazdu GPS. Zawartość plików, nie środowisko produkcyjne, została zweryfikowana przez porównanie sum.
