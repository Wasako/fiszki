# Single Source of Truth — stan aplikacji „Fiszki”

Dokument opisuje **aktualny stan** repozytorium: źródła JSON, jeden plik `js/app.js` (router + render + logika), `css/styles.css`, `index.html` oraz **pełną specyfikację UX** (nawigacja, layout, motywy, mobile/PWA, dostępność, stany brzegowe).

**Dla agentów / audytu UX:** sekcja **§3** jest samowystarczalna — po jej przeczytaniu można przeprowadzić dogłębny audyt interfejsu bez przeglądania całego kodu. Sekcje **§1–2** opisują dane i logikę (**§2.5** — onboarding i `fizki_config`); **§4** mapuje klasy CSS; **§5** — pliki.

**Produkcja:** https://fizki.pl (PWA, Vercel). Brak routingu URL per ekran — stan w pamięci + `history.pushState` bez zmiany ścieżki.

---

## 1. Struktura danych i powiązania

### 1.1 `data/fiszki-wzory.json` (fiszki / wzory CKE — **używane w runtime**)

- **Ładowanie:** `fetch("data/fiszki-wzory.json")` w `loadFiszkiWzory()` na początku `boot()`.
- **Format:** obiekt z polami `version`, `source` (informacyjnie: źródło `js/cards-wzory-cke.js`), tablica **`cards`**.
- **Pojedyncza karta (`cards[]`):**

| Pole | Znaczenie |
|------|-----------|
| `topic` | Nazwa działu (jak na karcie CKE). |
| `name` | Nazwa wzoru — w aplikacji **`front`** (zgodność z legendą i `sheetCardRefs` w zadaniach). |
| `symbol` | LaTeX lewej strony pierwszej relacji (`=`, `\le`, `\ge`, `\approx`) — w aplikacji **`symbolLatex`**; pusty / brak sensownego LHS → `null`. |
| `correct_latex` | Poprawny wzór KaTeX — mapowany na **`back`**. |
| `distractors` | Zwykle **3** łańcuchy LaTeX — **`quizDistractors`**. W quizie fiszek (**`buildFlashQuizChoices`**) trzy błędne odpowiedzi to najpierw losowe **`back`** innych kart z **tego samego działu** (`topic`), potem z całego poziomu (**`cardsForHomeLevel`**), potem z **`quizDistractors`**, na końcu z globalnego **`CARDS`**; kolejność czterech wariantów — **`fisherYatesShuffle`**. |

- **Regeneracja:** `node tools/gen-fiszki-wzory-json.mjs` (wejście: `js/cards-wzory-cke.js` → wyjście: `data/fiszki-wzory.json`). `cards-wzory-cke.js` **nie** jest `<script>` w `index.html`.

- **Legenda symboli:** `js/wzory-symbol-legends.js` ustawia `window.__WZORY_SYMBOL_LEGEND__`. Klucz = **`sheetSymbolLegendKey(topic, front)`** = `trim(topic) + '\x1e' + trim(front)` (`front` = `name` z JSON). Generator: `python tools/gen_wzory_symbol_legends.py` (spójny klucz po `.strip()` w skrypcie).

- **Zadania:** opcjonalne **`sheetCardRefs`** — pary `[topic, nazwaKarty]`; druga wartość = `name` / `front` fiszki, żeby `getTaskSheetLines()` i `SHEET_CARD_BACK_MAP` znalazły ten sam wzór co legenda.

### 1.2 `zadania.json` (katalog główny — **źródło zadań w runtime**)

- **Ładowanie:** `fetch("zadania.json")` w `loadZadaniaJson()` w `boot()` — nadpisuje **`TASK_LEVELS`**. Tablica poziomów obejmuje co najmniej **`lo-rozszerzenie`**, **`lo-podstawa`**, **`sp`** (id muszą zgadzać się z **`CURRICULUM_FILES`** / menu), każdy z własną tablicą **`sections`**. Dla każdego poziomu normalizowane są `sections` i `tasks` (puste tablice, gdy brak w JSON).
- **Jedyny plik zadań w przeglądarce** — nie ma osobnego `data/gemini-zadania.json` w tym przepływie.

**Bramka (`task-detail`):** `taskNeedsQuizGate(t)` jest **true**, gdy istnieje **`formulaQuiz`** z tablicą **`choices`** o długości **≥ 4**. Wtedy renderowany jest quiz; przyciski „Pokaż wzory / odpowiedź / pełne rozwiązanie” są **`disabled`** + **`btn-gated`**, dopóki **`taskQuizSolved`**. Opcje quizu: **`quiz-options quiz-options--stack task-quiz-options`** (jedna kolumna); każda opcja w **`.task-quiz-option-cell`** (przycisk + ewentualny blok rationale pod błędnym wyborem).

**Schemat `formulaQuiz`:**

| Pole | Typ | Opis |
|------|-----|------|
| `lhsLatex` | string | LHS / symbol kontekstu (m.in. legenda dopasowana przez `taskFormulaQuizLegendHaystack`). |
| `prompt` | string | Treść pytania (mixed → `richMixedLinesToHtml`). |
| `choices` | tablica (oczekiwane **4** obiekty) | `katex`, `correct`, opcjonalnie `distractorRationale`. |

**`distractorRationale`:** pod wybraną błędną opcją (`.task-quiz-option-rationale`), po **`richMixedLinesToHtml`**.

**Po odblokowaniu bramki:** pod **`#task-solution`** — **`.task-quiz-symbol-legend`** (symbole z bazy legendy dopasowane do łańcucha z quizu).

### 1.3 `data/curriculum-*.json`

| Plik | Poziom (`level.id`) |
|------|----------------------|
| `curriculum-lo-rozszerzenie.json` | `lo-rozszerzenie` |
| `curriculum-lo-podstawa.json` | `lo-podstawa` |
| `curriculum-sp.json` | `sp` |

- **Ładowanie:** `loadCurriculaAndLinks()` — błąd HTTP → wyjątek → **`showAppBootError()`**.
- **Treść:** drzewo **`curriculum`**; liście mogą mieć **`sectionRefs`** (id sekcji z `level.sections`). **UI:** ekran **`task-chapters`** pokazuje drzewo programu filtrowane przez **`userGrade`** (`getEffectiveClassFilterId()` → `sectionsForTaskClassFilter` / `renderTaskCurriculumTreeHtml`); przy **`userGrade === 'all'`** — pełne drzewo z nagłówkami klas; przy konkretnej klasie — tylko jej poddrzewo. Bez planu — płaska lista **`level.sections`**. Zawsze widać działy **z 0 zadań** (**`tasksLabel`**). **`getTaskSectionView`** scala zadania z wielu **`sectionRefs`** przy wejściu z liścia programu.
- **Powiązania:** `CURRICULUM_LINKS_BY_LEVEL`, `applyStaticCurriculumLinks`, `augmentGeminiCurriculumRefs`, **`applyHeuristicCurriculumSectionRefs`** (dla **`lo-podstawa`** i **`sp`** — domyślne `sectionRefs` dla liści bez jawnego mapowania), `syncCurriculumImportFolder` (folder „import” z nieprzypiętymi sekcjami).

### 1.4 Diagram zależności (uproszczony)

```mermaid
flowchart LR
  subgraph runtime_fetch [Runtime fetch / CDN]
    FW[data/fiszki-wzory.json]
    ZJ[zadania.json]
    CUR[data/curriculum-*.json]
    KTX[KaTeX CDN]
    LEG[js/wzory-symbol-legends.js]
  end
  subgraph app [js/app.js]
    CARDS[CARDS + SHEET_CARD_BACK_MAP]
    TL[TASK_LEVELS]
    RENDER[render]
  end
  FW --> CARDS
  ZJ --> TL
  CUR --> TL
  LEG --> RENDER
  KTX --> RENDER
  CARDS --> RENDER
  TL --> RENDER
```

### 1.5 Shell (`index.html`)

Struktura statyczna (poza `#app` całość UI jest w JS):

```
body (flex column, min-height 100dvh)
├─ .app-shell (max-width 28rem, wyśrodkowany)
│  ├─ header.app-brand — logo + breadcrumb profilu
│  └─ #app.app — dynamiczny UI (render)
└─ footer.app-footer (max-width 28rem) — PWA + motyw
```

| Element | Rola UX |
|---------|---------|
| **`header.app-brand`** | Wyśrodkowany blok: logo SVG (`fizki_yellow.svg` / `fizki_black.svg` wg motywu; bez XML/DOCTYPE w pliku) + **`#app-mini-breadcrumb`** — skrót profilu (np. „LO Rozsz. • Klasa I”); klik → ponowny onboarding od `onboarding-school`. Ukryty na ekranach onboardingu. |
| **`#app`** | Jedyny kontener dynamiczny; klasa **`app`**; padding `0.5rem 1rem 1rem`. |
| **`footer.app-footer`** | `#pwa-install-hint`, `#pwa-install`, `#theme-toggle` — poza `#app`, zawsze widoczne. |
| **FOUC motywu** | Inline script w `<head>`: `localStorage.fizki_theme` → `document.documentElement.dataset.theme` + `meta theme-color`. |
| **Style** | `css/styles.css` + KaTeX 0.16.11 z jsDelivr. |
| **Skrypty `defer`** | `katex.min.js` → `wzory-symbol-legends.js` → `app.js`. |
| **PWA meta** | `manifest.json`, ikony `/icons/`, Apple `mobile-web-app-*`, `theme-color` zsynchronizowany z motywem. |

---

## 2. Architektura logiki (`js/app.js`)

### 2.1 Stan globalny (najważniejsze zmienne)

| Zmienna | Rola |
|---------|------|
| **`screen`** | `'onboarding-school' \| 'onboarding-grade' \| 'main' \| 'flash-study' \| 'flash-complete' \| 'task-chapters' \| 'task-detail'`. |
| **`mainTab`** | `'fiszki' \| 'zadania' \| 'karta-wzorow'` — widoczny panel na `main`. |
| **`userLevel`** | Typ szkoły z onboardingu: **`sp`** \| **`lo-p`** \| **`lo-r`**. Zapis w **`localStorage.fizki_config`**. |
| **`userGrade`** | **`all`** (wszystkie klasy w planie) albo **id węzła klasy** z `curriculum` (np. `lo-rz-k1`, `sp-k7`). Zapis w **`fizki_config`**. |
| **`_pendingOnboardingLevel`** | Tymczasowy `userLevel` między krokiem 1 a 2 onboardingu (nie trafia do `localStorage`). |
| **`homeLevelId`** | **Pochodne** z `userLevel` (`USER_LEVEL_TO_HOME`: `lo-r` → `lo-rozszerzenie` itd.) — ustawiane przez **`applyFizkiConfig()`**; fiszki, karta wzorów, `taskLevelId` przy zadaniach. |
| **`sheetTopicIndex`** | Aktywny dział na ekranie **Karta wzorów**. |
| **`flashIndex`**, **`deck`** | Pozycja i talia w quizie fiszek; start z panelu **Fiszki**: **Szybka 10** (`fisherYatesShuffle` + max 10 kart), **Powtórka** (tylko `flashProgress[front]==='wrong'`), lub kafelek **działu** (wszystkie karty działu, losowo). |
| **`flashQuizPicked`** | `null` lub indeks wybranej opcji w **`quiz.choices`** (długość tablicy = liczba przycisków, zwykle 4). |
| **`flashQuizCache`** | `{ index, choices, correctIndex }` dla bieżącej karty (`index === flashIndex`); unieważniane przy zmianie karty / wyjściu. |
| **`flashProgress`** | `Record<string, 'correct'|'wrong'>` — postęp quizu fiszek: klucz = **`card.front`** (nazwa wzoru); brak klucza = niewyświetlony. Odczyt/zapis: **`localStorage`** pod kluczem **`fiszki_progress`** (`JSON.parse` / `JSON.stringify`); aktualizacja przy wyborze odpowiedzi w **`flash-study`**. |
| **`taskLevelId`**, **`taskSectionId`**, **`taskCurriculumPath`**, **`taskIndex`** | Nawigacja zadań: poziom, wybrany dział — **`id` sekcji z `level.sections`** albo **`id` liścia z `curriculum`** (wtedy **`getTaskSectionView`** scala **`sectionRefs`**), indeks zadania. **`taskCurriculumPath`** — zerowane przy wejściu w zadania / cofnięciach; **nie** steruje UI listy. |
| **`taskClassTabId`** | **Zsynchronizowane** z `userGrade` przez **`applyFizkiConfig()`** (`getEffectiveClassFilterId()`). Używane wewnętrznie przez filtry; **brak UI** `.tabs-task-class` (klasa tylko z onboardingu). |
| **`taskCurriculumExpandedIds`** | `Set` identyfikatorów **rozgałęzień** planu (`curriculum`), rozwiniętych na **`task-chapters`**. Czyszczone przy wejściu w **Zadania**, powrocie do Fiszki/Karta, ponownym onboardingu. |
| **`taskAnswerVisible`**, **`taskFormulasVisible`**, **`taskSolutionVisible`** | Rozwinięcie bloków `#task-answer`, `#formulas-box`, `#task-solution`. |
| **`lastTaskQuizGateKey`**, **`taskQuizPickIndex`**, **`taskQuizSolved`**, **`taskQuizUnlockAnim`** | Stan bramki: klucz `level\x1esection\x1eindex`, wybór w quizie, czy odblokowano, flaga jednorazowej animacji po poprawnej odpowiedzi. |

**Dane:** `CARDS`, `SHEET_CARD_BACK_MAP` (`rebuildSheetCardBackMap`), **`TASK_LEVELS`** (z JSON + `curriculum` z plików planu).

### 2.2 Boot aplikacji

1. **`showAppLoadingState()`** → markup **`app-loading`**.
2. **`await loadFiszkiWzory()`** — sukces HTTP + niepusta `cards` → `CARDS` + mapa wzorów.
3. **`await loadZadaniaJson()`** — sukces **`zadania.json`** → `TASK_LEVELS`.
4. **`await loadCurriculaAndLinks()`** — plany programu (wymagane do opcji klas w onboardingu).
5. **`installAppRootDelegation()`** + **`installAppBreadcrumbDelegation()`** — delegacja kliknięć (zakładki treści, breadcrumb → onboarding).
6. **`loadFizkiConfig()`** — odczyt **`localStorage.fizki_config`**. Jeśli **brak** lub niepoprawny → **`screen = 'onboarding-school'`**. Jeśli OK → **`applyFizkiConfig()`** (ustawia `homeLevelId`, waliduje `userGrade`, breadcrumb).
7. **`render()`** — pierwszy UI (onboarding lub `main`).
8. **`history.replaceState`** — tylko gdy ekran **nie** jest onboardingu.

**Błędy:** `catch` w `boot()` → `console.error` + **`showAppBootError()`** + przycisk przeładowania strony.

### 2.5 Profil użytkownika (`fizki_config` + onboarding)

**Klucz `localStorage`:** `fizki_config` → JSON `{ "userLevel": "lo-r", "userGrade": "all" }`.

| `userLevel` | Etykieta onboardingu | `homeLevelId` |
|-------------|----------------------|---------------|
| `sp` | Szkoła podstawowa | `sp` |
| `lo-p` | Liceum — podstawa | `lo-podstawa` |
| `lo-r` | Liceum — rozszerzenie | `lo-rozszerzenie` |

| `userGrade` | Znaczenie |
|-------------|-----------|
| `all` | Wszystkie klasy z planu (drzewo zadań jak przy „Wszystkie”); brak filtra `sectionsForTaskClassFilter`. |
| np. `lo-rz-k1`, `sp-k7` | Tylko działy / liście przypisane do poddrzewa tej klasy w `curriculum-*.json`. |

**Przepływ onboardingu:**

```mermaid
flowchart TD
  A[boot: brak fizki_config] --> B[onboarding-school]
  B -->|data-onboarding-school| C[onboarding-grade]
  C -->|data-onboarding-grade| D[saveFizkiConfig]
  D --> E[render main]
  F[Klik breadcrumb] --> B
```

| Ekran | Markup | Akcja |
|-------|--------|-------|
| **`onboarding-school`** | `renderOnboardingSchoolHtml()` — przyciski `data-onboarding-school` | Ustawia `_pendingOnboardingLevel` → `onboarding-grade` |
| **`onboarding-grade`** | `renderOnboardingGradeHtml()` — opcje z `gradeOptionsForUserLevel()` + **Wszystko** (`all`) | Zapis `userLevel` + `userGrade`, `saveFizkiConfig()`, `render('main')` |

**API konfiguracji:** `loadFizkiConfig`, `saveFizkiConfig`, `applyFizkiConfig`, `getEffectiveClassFilterId`, `homeLevelIdFromUserLevel`, `gradeOptionsForUserLevel`, `userGradeDisplayLabel`, `updateAppBreadcrumb`, `installAppBreadcrumbDelegation`.

**Usunięte z UI:** `.tabs.tabs-level` (`data-home-level`) — poziom szkoły **nie** jest już przełączany zakładkami na każdym ekranie.

### 2.3 Kluczowe funkcje i pipeline

| Funkcja | Odpowiedzialność |
|---------|------------------|
| **`render()`** | Router: **`onboarding-school`** → **`onboarding-grade`** → **`main`** → flash → zadania. **`homeNavTabsHtml()`** — tylko **`tabs-main`** (bez **`tabs-level`**). Na **`main`**: **`applyFizkiConfig()`** + **`applyMainTabPanels`**. **Delegacja `#app`**: tylko **`data-main-tab`** (bez **`data-home-level`**); Zadania → **`applyFizkiConfig()`**, **`taskLevelId = homeLevelId`**, **`task-chapters`**. |
| **`applyMainTabPanels`**, **`installAppRootDelegation`**, **`onSheetTopicSelectMaybe`** | Zakładki treści; Fiszki/Karta na `task-*` → **`goToMainFromTasks`**. |
| **`loadFizkiConfig`**, **`saveFizkiConfig`**, **`applyFizkiConfig`**, **`homeNavTabsHtml`**, **`renderOnboardingSchoolHtml`**, **`renderOnboardingGradeHtml`**, **`updateAppBreadcrumb`** | Profil użytkownika, onboarding, breadcrumb — §2.5. |
| **`cardsForHomeLevel`**, **`cardVisibleForHomeLevel`**, **`groupCardsByTopicInOrder`**, **`countFlashStatsForCards`**, **`flashTopicTriGradientStyle`**, **`renderFiszkiPanelInnerHtml`** | Filtrowanie fiszek wg poziomu; grupowanie po **`topic`** dla panelu Fiszki i Karty wzorów; liczniki postępu (`flashProgress`); pasek trójkolorowy; HTML zakładki **Fiszki** na **`main`**. |
| **`fisherYatesShuffle`**, **`buildFlashQuizChoices`** | Quiz fiszek: cztery warianty LaTeXu — poprawny `back` + trzy dystraktory z innych wzorów (priorytet: ten sam `topic`, potem poziom, potem `quizDistractors`, potem `CARDS`); **`fisherYatesShuffle`**. |
| **`taskNeedsQuizGate`** | Warunek bramki (`formulaQuiz` + `choices.length >= 4`). |
| **`getSection`**, **`getLevel`**, **`getTaskSheetLines`**, **`getSolutionSteps`** | Nawigacja i treść pomocnicza zadań (w tym kroki rozwiązania z `solutionSteps`). |
| **`collectSectionIdsUnderCurriculumSubtree`**, **`sectionsForTaskClassFilter`**, **`normalizeUserGradeForLevel`**, **`normalizeTaskClassTabId`**, **`curriculumVisibleClassRoots`**, **`renderTaskCurriculumTreeHtml`**, **`renderCurriculumSubtree`**, **`countTasksOnCurriculumLeaf`**, **`countTasksUnderCurriculumNode`** | **Zadania:** filtr klasy z **`getEffectiveClassFilterId()`** (z `userGrade`); drzewo / płaska lista; **`taskClassTabsHtml`** pozostaje w kodzie, **nie** jest renderowane na liście zadań. |
| **`sheetSymbolLegendKey`**, **`getCardSymbolLegendEntries`**, **`taskFormulaQuizLegendHaystack`**, **`getLegendEntriesMatchingHaystack`**, **`symbolLegendBlockHtml`** | Legenda na fiszkach / karcie wzorów; po bramce — dopasowanie symboli do treści `formulaQuiz`. |
| **`parseFlashFormulaLines`**, **`flashQuizFormulaBlockHtml`** | Podział `back` / wariantu quizu na wiele linii (warunek w `()`, `\quad (\text{…})`, drugie równanie po `,\quad`); używane w quizie fiszek i na karcie wzorów (**`renderSheetTopicCardsHtml`**). |
| **`physicsPlainToLatex`**, **`richMixedLinesToHtml`**, **`katexHostHtml`**, **`escapeHtml`** | Konwersja treści i placeholdery **`data-katex`** na elementach **`.katex-host`**. |
| **`mountKatexIn`**, **`queueMountKatex`** | `katex.render` na hostach; przed renderem host jest czyszczony (`textContent = ''`), żeby uniknąć nakładania przy ponownym montażu. |
| **`buildTaskNavSequence`**, **`findTaskNavIndex`**, **`navigateTaskBy`** | Kolejność zadań przez drzewo planu (liście) lub płaską listę działów; **Poprzednie/Następne** na `task-detail` przechodzą między sekcjami. |
| **`goToMainFromTasks`**, **`appHistoryState`**, **`pushAppHistory`**, **`restoreAppHistory`** | Historia bez zmiany URL; **`restoreAppHistory`** wywołuje **`loadFizkiConfig()`** (profil z `localStorage`, nie z `history.state`). |

### 2.4 Quiz fiszek — brak „legacy” w runtime

- W **`js/app.js`** nie ma **`collectWrongTexCandidates`** ani runtime’owego dokładania puli wyłącznie z **`distractors`** w JSON: **`buildFlashQuizChoices`** dobiera **trzy błędne wzory** z innych kart (**`back`**) — priorytet ten sam **`topic`**, potem cały poziom, potem **`quizDistractors`**, potem **`CARDS`**. Heurystyki budowy **`distractors`** w JSON mogą żyć w **`tools/gen-fiszki-wzory-json.mjs`** (Node), osobno od przeglądarki.

---

## 3. Specyfikacja UX (audyt)

### 3.0 Cel i paradygmat

- **SPA bez routera URL:** jeden adres `/`; ekrany to wartość **`screen`** + zmienne stanu w `js/app.js`. Użytkownik nie może udostępnić linku do konkretnego zadania ani fiszki.
- **Mobile-first:** kolumna **`max-width: 28rem`**, wyśrodkowana na całej szerokości viewportu (brak osobnego layoutu „desktop wide”).
- **Język UI:** polski (`lang="pl"`).
- **Główne moduły treści:** Fiszki (quiz wzorów), Karta wzorów (przeglądarka), Zadania (lista + szczegół z opcjonalną bramką `formulaQuiz`).
- **Profil użytkownika:** wymuszony **dwuetapowy onboarding** przy pierwszej wizycie; później zmiana przez **breadcrumb** w nagłówku (bez stałych zakładek poziomu).

### 3.1 Architektura informacji

#### Drzewo nawigacji

```
index.html (logo + #app-mini-breadcrumb + footer)
├─ screen: onboarding-school → onboarding-grade (brak fizki_config)
└─ #app
   ├─ screen: main
   │  ├─ tabs-main (Fiszki | Karta wzorów | Zadania)
   │  ├─ #panel-fiszki — tryby + kafelki działów
   │  ├─ #panel-karta-wzorow — select działu + lista wzorów
   │  └─ #panel-zadania — pusty stub
   ├─ screen: flash-study → flash-complete
   └─ screen: task-chapters
      ├─ drzewo programu (filtrowane userGrade) LUB płaska lista
      ├─ lista zadań w dziale
      └─ screen: task-detail (+ Poprzednie/Następne)
```

#### Ekrany (`screen`)

| Wartość | Wejście | Wyjście / powrót |
|---------|---------|------------------|
| **`onboarding-school`** | Boot bez `fizki_config`, klik breadcrumb | Wybór szkoły → `onboarding-grade` |
| **`onboarding-grade`** | Krok 2 onboardingu | Zapis config → `main` |
| **`main`** | Po onboardingu, `goToMainFromTasks`, `popstate` | Fiszki → `flash-study`; Zadania → `task-chapters` |
| **`flash-study`** | `data-flash-mode` / `data-flash-topic` | `#btn-main` → `history.back()`; ostatnia karta + odpowiedź → `flash-complete` |
| **`flash-complete`** | Koniec talii | `#btn-flash-complete-menu` → `main` |
| **`task-chapters`** | Zakładka Zadania | Wybór działu → lista zadań; liść planu → ta sama lista |
| **`task-detail`** | `data-task-i` | `#btn-back-list` → `history.back()`; zakładki Fiszki/Karta → `goToMainFromTasks` |

#### Nawigacja treści i profil

| Element | Klasa / ID | Rola |
|---------|------------|------|
| Zakładki modułów | `.tabs.tabs-main` | `data-main-tab`: Fiszki, Karta wzorów, Zadania — `main`, `task-chapters`, `task-detail` |
| Breadcrumb profilu | `#app-mini-breadcrumb` | Skrót szkoły + klasa; klik → `onboarding-school` |
| ~~Poziom szkoły~~ | ~~`.tabs-level`~~ | **Usunięte** — zastąpione onboardingiem |
| ~~Klasa na liście zadań~~ | ~~`.tabs-task-class`~~ | **Usunięte z UI** — klasa z `userGrade` w `fizki_config` |

**Filtrowanie fiszek / karty** (`cardVisibleForHomeLevel` + `homeLevelId` z `userLevel`):

| Poziom | Widoczne karty |
|--------|----------------|
| `lo-rozszerzenie` | `scope === "cke"` |
| `lo-podstawa` | `scope === "podstawowka"`, bez tematów tylko-rozszerzeniowych, bez kluczy z `WZORY_EXCLUDE_LO_P_CARD_KEYS` |
| `sp` | jak podstawa + `showSp !== false` |

### 3.2 Shell, layout, breakpointy

| Token / reguła | Wartość | Skutek UX |
|----------------|---------|-----------|
| `.app-shell`, `.app-footer` | `max-width: 28rem` | Wąska kolumna na wszystkich urządzeniach |
| `body` | `flex` column, `min-height: 100dvh` | Footer na dole strony |
| Logo + breadcrumb | `.app-brand` wyśrodkowany; `.app-mini-breadcrumb` pod logo | Kontekst szkoły/klasy bez zajmowania miejsca trzema zakładkami poziomu |
| **`@media (max-width: 768px)`** | `.tabs-main` → `position: fixed; bottom: 0; width: 100%` | Dolny pasek Fiszki/Karta/Zadania; `#app { padding-bottom: 80px }`; footer odsunięty (`margin-bottom: ~4.75rem + safe-area`) |
| **`@media (max-width: 360px)`** | `.quiz-options--grid2` → 1 kolumna | (grid2 nieużywany w JS — reguła zapasowa) |
| **`@media (min-width: 28rem)`** | `.task-quiz-symbol-legend` → 2 kolumny | Legenda po bramce zadania |

**Strefy nawigacji na mobile (≤768px):** góra = breadcrumb profilu (shell) + treść `#app`; dół = `tabs-main` fixed + footer. **Jeden** rząd zakładek modułów (bez `tabs-level` u góry treści).

### 3.3 System zakładek (slider) — tylko moduły treści

- Jedyny aktywny rząd: **`.tabs.tabs-main`** (Fiszki / Karta wzorów / Zadania). **`data-slider-group="main"`**.
- Wzorzec: segmented control — żółty **`tab-slider`**, tekst aktywnej zakładki **#000000** na pill.
- **`updateTabSliders()`** + **`sliderPositionsCache`** — po `innerHTML` i `resize`.
- **Zachowanie kliknięć** (`installAppRootDelegation`): jak wcześniej, **bez** obsługi `data-home-level`.
- Zadania: **`applyFizkiConfig()`** przed wejściem w listę — `taskLevelId` = `homeLevelId` z profilu.

### 3.4 Motyw wizualny (design tokens)

| Token | Dark (`:root`) | Light (`[data-theme="light"]`) |
|-------|----------------|--------------------------------|
| `--bg-main` | `#121212` | `#f4f4f9` |
| `--bg-card` | `#1e1e24` | `#ffffff` |
| `--text-main` | `#f5f5f5` | `#1a1a1a` |
| `--text-muted` | `#a0a0a0` | `#5c5c5c` |
| `--accent-fizki` | `#ffc700` | (to samo) |
| `--status-correct` / wrong / new | zielony / pomarańcz / niebieski | ciemniejsze warianty |
| `--radius` | `16px` | |
| Font | `"Segoe UI", system-ui, sans-serif` | |

- **Przełącznik:** `#theme-toggle` w footerze; tekst widoczny „🌓 Zmień motyw”, **`aria-label`** poprawny; delegacja na `document` (raz).
- **Storage:** `localStorage.fizki_theme` = `dark` \| `light`; domyślnie `dark`.
- **`meta theme-color`:** `#121212` / `#f4f4f9`; `manifest.json`: `theme_color` `#121212` (nie przełącza się z motywem w OS).

**Semantyka kolorów kart zadań:** rozdziały — białe/surface (`--bg-card`); podrozdziały — żółty tint (`color-mix` z `--accent-fizki`).

### 3.5 Historia przeglądarki (`history` API)

**Stan serializowany** (`appHistoryState`): `screen`, `mainTab`, `homeLevelId`, `taskLevelId`, `taskSectionId`, `taskCurriculumPath`, `taskIndex`.

| Akcja | API |
|-------|-----|
| Wejście w Zadania / zadanie / zmiana działu w nawigacji seq. | `pushAppHistory()` |
| Boot | `replaceState(..., "")` |
| Powrót z zadań do Fiszki/Karta | `replaceState` w `goToMainFromTasks` |
| Wstecz w UI | `history.back()` (`#btn-back-chapters`, `#btn-back-list`, `#btn-main`, flash) |
| Przycisk Wstecz przeglądarki | `popstate` → `restoreAppHistory` + `render()` |
| Pusty `popstate.state` | fallback: `main` + `mainTab = 'fiszki'` |

**Nawigacja między zadaniami:** `buildTaskNavSequence` → kolejność liści planu (DFS), potem płaska lista działów; **`navigateTaskBy(±1)`** — „Poprzednie” / „Następne” na `task-detail`, przechodzi między działami; przy zmianie `sectionId` robi `pushAppHistory`.

**Uwaga audytu:** rozwijanie rozdziału (`data-rozdzial-id`) wywołuje pełny **`render()`** + View Transition, **bez** wpisu w historii.

### 3.6 Ekrany — szczegóły

#### `main` + Fiszki (`#panel-fiszki`)

- **`renderFiszkiPanelInnerHtml`:** rząd trybów + siatka kafelków działów.
- **Tryby:** `data-flash-mode="quick10"` (max 10 losowych), `"review-wrong"` (tylko `flashProgress[front]==='wrong'`) — **`disabled`** gdy pula pusta.
- **Kafelek działu:** `data-flash-topic`; liczniki poprawne/błędne/niewyświetlone; pasek **`flashTopicTriGradientStyle`** (zielony/czerwony/granatowy).
- **Postęp:** `localStorage` klucz **`fiszki_progress`**, mapa po `card.front`.

#### `flash-study` / `flash-complete`

- **Bez** `homeNavTabsHtml` — tylko `top-bar` „← Menu”, postęp `N / M`, scena quizu.
- **Quiz:** 4 opcje **`data-quiz-opt`**, układ **`quiz-options--stack`**; po wyborze — `disabled`, klasy correct/wrong; pełna fiszka w **`.quiz-flip-face`** (`aria-live="polite"`).
- **Stały slot pytania:** `.quiz-prompt-slot` — wysokość `clamp` (anty-skok layoutu przy ujawnieniu wzoru).
- **Wstecz/Dalej:** zmiana `flashIndex`; na ostatniej karcie „Dalej” po odpowiedzi → `flash-complete`.
- **Pusty deck:** `history.back()`.

#### `main` + Karta wzorów

- **`sheet-layout`:** `<select id="sheet-topic-select">` + `#sheet-topic-body` (przewijana lista).
- Zmiana działu: **`applySheetTopicSelectChange`** (rAF, bez pełnego `render`) + `queueMountKatex`.
- **SP:** link PDF (`SP_OFFICIAL_SHEET_PDF_URL`), nowa karta.

#### `main` + Zadania

- **`#panel-zadania`** — pusty; treść zadań **nigdy** nie jest osadzana na `main`.

#### `task-chapters`

- **`applyFizkiConfig()`** na wejściu — `taskLevelId` zsynchronizowany z `homeLevelId` profilu.
- **Brak** `tabs-task-class` — filtr klasy z **`userGrade`** (`getEffectiveClassFilterId()`).
- Z planem: nagłówek „Działy” + drzewo (`renderTaskCurriculumTreeHtml(level, classFilter)`); przy `userGrade === 'all'` — nagłówki klas w drzewie jak wcześniej.
- Rozdziały **domyślnie zwinięte**; `.task-podrozdzial-stack[hidden]` → `display: none !important`.
- Lista zadań w dziale: **`#btn-back-chapters`** „← Działy”.

#### `task-detail`

- `homeNavTabsHtml` + `top-bar` (**`#btn-back-list`** „← Lista”) + pasek postępu w dziale.
- **Bramka:** gdy `taskNeedsQuizGate` — quiz `data-task-quiz-opt`; przyciski Pokaż wzory/odpowiedź/rozwiązanie: **`disabled`** + **`.btn-gated`** do poprawnej odpowiedzi.
- Po odblokowaniu: **`.task-quiz-symbol-legend`**, animacja **`.task-quiz-unlock-anim`** na `.task-sheet`.
- **Poprzednie/Następne:** `#btn-task-prev` / `#btn-task-next` — globalna sekwencja z `buildTaskNavSequence`.

### 3.7 Komponenty i wzorce interakcji

| Komponent | Kluczowe klasy / ID | Interakcja |
|-----------|---------------------|------------|
| Przycisk primary | `.btn` | Pełna szerokość, żółty, czarny tekst |
| Przycisk wstecz | `.btn-back`, `.btn-secondary` | W `top-bar` |
| Lista | `.list-item`, `.list-stack` | Klik → nawigacja |
| Quiz opcja (fiszki) | `.quiz-option`, `data-quiz-opt` | Jednokrotny wybór |
| Quiz bramka | `.task-quiz-option-cell`, `data-task-quiz-opt` | + rationale pod błędnym |
| KaTeX | `.katex-host[data-katex]` | `mountKatexIn` po renderze; błąd → surowy TeX |
| View Transitions | `document.startViewTransition` | Każdy `render()` gdy API dostępne (0.25s fade+slide) |

**Dwa systemy quizu (niezamienne):** fiszki używają `buildFlashQuizChoices` + `data-quiz-opt`; zadania — JSON `formulaQuiz` + `data-task-quiz-opt`.

**Legacy CSS (niepodpięte w JS):** `.card`, `.card-inner`, `.flipped` — stary 3D flip fiszek; **`quiz-card--flip`** to inny wzorzec (ujawnienie treści, nie obrót karty).

### 3.8 Mobile i PWA

| Element | Zachowanie |
|---------|------------|
| **`manifest.json`** | `display: standalone`, `start_url` `/`, ikony 192/512 |
| **Service Worker** | `sw.js`, cache **`fizki-v4`**; precache HTML/CSS/JS/JSON/logo; nawigacja stale-while-revalidate; `/admin`, `/api` pomijane |
| **Instalacja** | `beforeinstallprompt` → `#pwa-install`; po 4 s bez promptu → `#pwa-install-hint` (`pwaManualInstallText` — iOS/Android/desktop); ukryte w standalone i na `/admin` |
| **Bez `preventDefault`** na `beforeinstallprompt` | Chrome może pokazać natywny banner |
| **Apple** | `apple-mobile-web-app-*`, touch icon 192 |

**Audyt offline:** po pierwszej wizycie aplikacja może działać z cache; nowe wersje wymagają odświeżenia SW (brak UI „nowa wersja” poza `console.warn` przy rejestracji).

### 3.9 Dostępność (a11y)

**Zaimplementowane:**

- Tablisty: `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-labelledby` na panelach.
- `aria-expanded` na nagłówkach rozdziałów planu.
- `aria-label` na opcjach quizu, kafelkach działów, grupach opcji.
- `aria-live="polite"` na ładowaniu, ujawnieniu fiszki, blokach odpowiedzi/wzorów/rozwiązania.
- `aria-hidden="true"` na sliderze, chevronach, paskach dekoracyjnych.
- `aria-busy="true"` podczas boot loading.
- `focus-visible` na `.tab`, `.btn-theme-toggle`, **`.app-mini-breadcrumb`**.
- Logo: nazwa w `aria-label` linku; `alt=""` na `<img>` (dekoracyjne względem linku).
- `<label for="sheet-topic-select">` na karcie wzorów.

**Luki (do audytu):**

- Brak nawigacji strzałkami w tablistach (brak roving `tabindex`).
- Zmiana zakładki / ekranu **bez** live regionu ogłaszającego kontekst.
- Kontrast selected tab opiera się na żółtym pill + `#000` — OK wizualnie; brak wzmocnienia poza kolorem dla nieaktywnych zakładek w light mode.
- Emoji w widocznym tekście przycisków PWA/motywu (screen reader czyta emoji).
- Długie wzory: poziomy scroll bez widocznego paska (ukryte scrollbary, scroll dotykiem działa).

### 3.10 Stany brzegowe i copy UI

| Sytuacja | Zachowanie / tekst |
|----------|-------------------|
| Błąd boot (fetch) | `.app-boot-error` + przycisk przeładowania |
| Nieznany `screen` | Ostrzeżenie + przycisk powrotu do `main` |
| Brak kart dla poziomu | `disabled` quick/review; hint „Brak fiszek…” |
| Brak działów na karcie | Hint w `renderKartaWzorowPanelHtml` |
| Pusty dział zadań | „Brak zadań w tym dziale…” |
| Brak planu / działów | Hint kontekstowy; przy wybranej klasie — „zmień klasę w ustawieniach u góry” |
| Brak `fizki_config` | Wymuszony onboarding (nie widać `main` do zapisu) |
| Niepoprawny `userGrade` w config | `applyFizkiConfig` → reset do `all` |
| Poziom spoza `TASK_LEVELS` | Syntetyczny `hl` z `HOME_LEVEL_FALLBACK_TITLES` |
| Bramka zadania | Przyciski zablokowane do poprawnej odpowiedzi |
| Brak legendy po bramce | „Brak dopasowanych symboli…” |
| KaTeX error | Surowy TeX w hoście |
| &lt;3 dystraktorów fiszek | Placeholder `\text{·N}` w opcji |

### 3.11 Znane quirk'i i dług techniczny UX

1. **`#panel-zadania` pusty** — Zadania zawsze zmieniają `screen`, nie panel na `main`.
2. **`tabs-main` na mobile (≤768px)** — fixed na dole; breadcrumb profilu w shellu u góry.
3. **Zmiana szkoły/klasy wymaga onboardingu** — breadcrumb nie edytuje inline, tylko uruchamia pełny flow od `onboarding-school` (stary `fizki_config` obowiązuje do zapisu nowego).
4. **`userGrade` w storage to id planu** (np. `lo-rz-k1`), nie numer „1”/„2” — etykieta z `curriculum.title`.
5. **`taskClassTabsHtml`** — funkcja w kodzie, UI wyłączone; filtr przez `getEffectiveClassFilterId()`.
6. **View Transition na każdy `render()`** — także expand rozdziału.
7. **`quiz-options--grid2`** / **legacy `.card` flip** — martwe ścieżki CSS.
8. **Brak deep linków** — brak URL per zadanie/fiszka/profil.
9. **Logo SVG** — bez zewnętrznego DTD; bump cache SW przy zmianie assetów.
10. **Brak przycisku „Menu” na korzeniu `task-chapters`** — zakładki Fiszki/Karta lub historia.
11. **`history.state` nie zawiera `userLevel`/`userGrade`** — przy `popstate` profil zawsze z `loadFizkiConfig()` z `localStorage`.

### 3.12 Checklist audytu UX

Użyj przy przeglądzie lub regresji. Oznacz: ✅ OK / ⚠️ do poprawy / ❌ błąd.

**Onboarding i profil**

- [ ] Pierwsza wizyta bez `fizki_config` → onboarding-school → grade → main.
- [ ] Breadcrumb pokazuje poprawny skrót (szkoła • klasa / Wszystko).
- [ ] Klik breadcrumb → onboarding; po zapisie nowy profil filtruje treść.
- [ ] `localStorage.fizki_config` przetrwa odświeżenie.

**Nawigacja i IA**

- [ ] Na mobile dolny `tabs-main` nie zasłania treści (padding 80px) ani footeru (safe area).
- [ ] Przejście Fiszki → quiz → Menu → powrót zachowuje profil i `mainTab`.
- [ ] Zadania: przy `userGrade !== 'all'` widać tylko działy wybranej klasy.
- [ ] Zadania: drzewo → dział → zadanie → Poprzednie/Następne w granicach filtra klasy.
- [ ] `history.back` i zakładki Fiszki/Karta dają spójny stos.

**Wizual i motyw**

- [ ] Dark/light: logo, tło, karty, zakładki, quiz feedback.
- [ ] Żółty akcent spójny z logo; tekst na żółtym czytelny (#000).
- [ ] Paski postępu fiszek (zielony/czerwony/niebieski) rozróżnialne w obu motywach.

**Fiszki i quiz**

- [ ] Quick 10 / Powtórka / dział — poprawne `disabled` przy pustej puli.
- [ ] Po odpowiedzi: brak skoku layoutu (prompt slot).
- [ ] 4 opcje czytelne na wąskim ekranie; długi LaTeX przewijalny.
- [ ] Postęp utrzymuje się po odświeżeniu (`fiszki_progress`).

**Karta wzorów**

- [ ] Zmiana działu bez pełnego przeładowania UI; KaTeX montuje się poprawnie.
- [ ] Link PDF SP tylko dla `homeLevelId === 'sp'`.

**Zadania**

- [ ] Bramka: zablokowane akcje do poprawnej odpowiedzi; rationale pod błędną opcją.
- [ ] Po bramce: legenda symboli lub hint.
- [ ] Rozwijanie rozdziałów nie psuje scrolla / focusu.

**PWA i performance**

- [ ] Instalacja / hint po 4 s (nie w standalone).
- [ ] Offline: podstawowy flow po precache.
- [ ] Nowy deploy: użytkownik dostaje świeże logo/CSS (cache bump).

**A11y**

- [ ] Focus widoczny na tabach i footerze.
- [ ] Tablisty: sensowna kolejność Tab; brak pułapek focusu w `fixed` dolnym pasku.
- [ ] `aria-live` nie nadmiarowo ogłasza KaTeX.

---


## 4. Warstwa prezentacji (`css/styles.css`)

Mapowanie klas → UX (uzupełnienie §3). Breakpointy: **360px**, **28rem**, **768px**.

| Klasa / selektor | Rola UX |
|------------------|---------|
| **`:root`**, **`[data-theme="light"]`** | Tokeny kolorów — §3.4. |
| **`.app-shell`**, **`.app-brand`**, **`.app-logo*`**, **`.app-mini-breadcrumb`**, **`.app-footer*`**, **`.btn-theme-toggle`**, **`.pwa-install-hint`** | Shell: logo, breadcrumb profilu, footer — §1.5, §2.5, §3.2. |
| **`.onboarding`**, **`.onboarding-title`**, **`.onboarding-sub`**, **`.onboarding-options`**, **`.onboarding-option`** | Ekrany onboardingu — §2.5. |
| **`.app-loading`**, **`.app-boot-error`** | Boot / błąd ładowania — §3.10. |
| **`.tabs`**, **`.tab-slider`**, **`.tab`**, **`.tabs-main`** | Zakładki modułów + pill — §3.3 (**bez** `.tabs-level` w UI). |
| **`.tabs-task-class`** | Style pozostają; **nieużywane** w renderze listy zadań po onboardingu. |
| **`.top-bar`**, **`.top-bar-title`**, **`.btn-back`**, **`.btn-link-back`** | Pasek podrzędnych ekranów (quiz, zadania). |
| **`.flash-mode-row`**, **`.flash-topic-grid`**, **`.flash-topic-tile`**, **`.flash-topic-bar`**, **`.flash-topic-heading`** | Panel **Fiszki** na `main`: tryby globalne, kafelki działów, pasek postępu trójkolorowy. |
| **`.task-podrozdzial-stack[hidden]`** | Wymusza **`display: none`**, bo sam **`[hidden]`** przegrywa z **`display: flex`** na **`.task-podrozdzial-stack`**. |
| **`.task-chapters-toolbar`**, **`.btn-link-back`**, **`.task-dzialy-heading`**, **`.task-class-heading`**, **`.task-rozdzial*`**, **`.task-podrozdzial-*`** | Lista **Zadania**: link wstecz, nagłówki klasy (widok „Wszystkie”), rozdziały i podrozdziały z planu programu. |
| **`.sheet-official-pdf`**, **`.sheet-official-pdf-link`**, **`.sheet-official-pdf-note`** | Link do zewnętrznego PDF karty wzorów SP (nad panelem wzorów). |
| **`.quiz-prompt-slot`**, **`.quiz-prompt-question`**, **`.quiz-card--flip`**, **`.quiz-flip-face`**, **`.quiz-flip-topic`**, **`.quiz-flip-formula`**, **`.quiz-question-title`**, **`.quiz-flip-face .symbol-legend*`** | Quiz fiszek: stały slot na pytanie/pełną fiszkę; na odwrocie — duży wzór (**`.quiz-flip-formula`** **~1.55rem**, KaTeX **~1.65em**) i nieco większa legenda niż globalna **`.symbol-legend`**; opcje **`minmax(4.15rem, auto)`**, **`minmax(0, 1fr)`**, KaTeX **~1.45em** w przyciskach. |
| **`.quiz-option`**, **`.quiz-option-formula`**, **`.quiz-formula-stack`**, **`.quiz-formula-main`**, **`.quiz-formula-hint`**, **`.sheet-formula-stack`** | Zawijanie długiego LaTeXu w opcjach; **`parseFlashFormulaLines`** + **`flashQuizFormulaBlockHtml`**: osobne linie dla `\quad (\text{…})`, warunku w `()`, drugiego równania po `,\quad`; dopisek **`s — liczba współrzędnych…`** tylko w legendzie (bez wzoru). |
| **`.quiz-options`**, **`.quiz-options--grid2`**, **`.quiz-options--stack`** | Siatka opcji quizu: **`--stack`** — jedna kolumna (fiszki + bramka zadania); **`--grid2`** — zarezerwowane (np. przyszły układ 2×2). Na wąskim ekranie reguła dla **`--grid2`** może spaść do jednej kolumny. |
| **`.task-sheet .task-quiz-options.quiz-options--stack`** | Bramka zadania: **`grid-auto-rows: auto`** — komórki z rationale mogą rosnąć. |
| **`.task-quiz-option-cell`**, **`.task-quiz-option-rationale`*** | Komórka opcji bramki + tekst wskazówki pod błędnym wyborem. |
| **`.task-quiz-unlock-anim`** + **`@keyframes task-quiz-unlock-in`** | Animacja **`.task-actions`** po poprawnej odpowiedzi. |
| **`.task-quiz-symbol-legend`** | Legenda po bramce (siatka 2 kolumn od ~`28rem`). |
| **`.quiz-option.is-vector-distractor`** | Wzmocnienie zapisu wektorowego (fiszki i zadania — gdy w LaTeX opcji jest **`\vec`**). |
| **`.quiz-option--correct`**, **`.quiz-option--wrong-pick`**, **`.btn-gated`** | Stany odpowiedzi i zablokowane przyciski przy bramce. |
| **`.answer-block.hidden`**, **`.formulas-block.hidden`**, **`.solution-block.hidden`** | Ukrycie bloków do czasu „Pokaż…”. |
| **`.card`**, **`.card-inner`**, **`.flipped`** | **Legacy** — 3D flip (nieużywane w `app.js`). |
| **`::view-transition-old/new(root)`** | Animacja przejść między ekranami — §3.7. |
| **`@media (max-width: 768px)`** | Dolny pasek **`.tabs-main`**, padding **`#app`**, offset **`.app-footer`**. |

---

## 5. Skrót plików wejścia/wyjścia

| Zasób | Ścieżka | Używany w przeglądarce |
|-------|---------|-------------------------|
| Fiszki CKE | `data/fiszki-wzory.json` | Tak |
| Karta wzorów SP (PDF, zewnętrzna) | `https://www.sp-sobienie.pl/images/sampledata/WZORY/wzory%20fizyka.pdf` | Tak (link w UI przy **`homeLevelId === 'sp'`**; stała **`SP_OFFICIAL_SHEET_PDF_URL`** w `app.js`) |
| Zadania | `zadania.json` (root) | Tak |
| Plany programu | `data/curriculum-*.json` | Tak |
| KaTeX | CDN jsDelivr (`katex.min.js` / `.css`) | Tak |
| Legenda symboli | `js/wzory-symbol-legends.js` | Tak (przed `app.js`) |
| Logika | `js/app.js` | Tak |
| Style | `css/styles.css` | Tak |
| Shell | `index.html` | Tak |
| Logo | `logo/fizki_yellow.svg`, `logo/fizki_black.svg` | Tak (precache SW) |
| PWA manifest | `manifest.json` | Tak |
| Service Worker | `sw.js` (`fizki-v4`) | Tak |
| Źródło generatora fiszek JSON | `js/cards-wzory-cke.js` | Tylko Node (`tools/gen-fiszki-wzory-json.mjs`) |
| Generator legendy | `tools/gen_wzory_symbol_legends.py` | Tylko Node |
| **Ten dokument** | `docs/SINGLE_SOURCE_OF_TRUTH.md` | Spec UX + dane |

---

*Dokument zsynchronizowany ze stanem kodu (w tym UX: onboarding, `fizki_config`, breadcrumb, zakładki treści, mobile/PWA, a11y). Po zmianach w `app.js`, `styles.css`, `index.html` lub kontrakcie JSON — zaktualizuj §2.5 (profil) i §3 (UX).*
