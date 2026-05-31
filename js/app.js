(function () {
  "use strict";

  /** @type {readonly { id: string; name: string; photoUrl: string; bio: string; price: string; levels: string[]; availableSlots: string[] }[]} */
  const MOCK_TEACHERS = [
    {
      id: "teacher-1",
      name: "Anna Kowalska",
      photoUrl: "https://ui-avatars.com/api/?name=Anna+Kowalska&background=6366f1&color=fff&size=128",
      bio: "Nauczycielka fizyki z 8-letnim doświadczeniem. Specjalizacja: mechanika i termodynamika.",
      price: "100 zł/h",
      levels: ["Szkoła podstawowa", "Liceum", "Matura"],
      availableSlots: ["Pon 16:00", "Wt 17:00", "Czw 18:00"],
    },
    {
      id: "teacher-2",
      name: "Marek Nowak",
      photoUrl: "https://ui-avatars.com/api/?name=Marek+Nowak&background=0ea5e9&color=fff&size=128",
      bio: "Korepetycje z fizyki i matematyki. Przygotowanie do egzaminu ósmoklasisty i matury.",
      price: "120 zł/h",
      levels: ["Szkoła podstawowa", "Liceum"],
      availableSlots: ["Wt 15:30", "Śr 16:00", "Pt 17:30"],
    },
    {
      id: "teacher-3",
      name: "Karolina Wiśniewska",
      photoUrl: "https://ui-avatars.com/api/?name=Karolina+Wisniewska&background=f59e0b&color=fff&size=128",
      bio: "Studentka fizyki na UW. Pomaga w zadaniach domowych i przygotowaniu do sprawdzianów.",
      price: "80 zł/h",
      levels: ["Szkoła podstawowa", "Matura"],
      availableSlots: ["Pon 18:00", "Czw 16:30", "Sob 10:00"],
    },
  ];

  /** @param {string} s */
  function texText(s) {
    return String(s)
      .replace(/\\/g, "\\\\")
      .replace(/\{/g, "\\{")
      .replace(/\}/g, "\\}")
      .replace(/%/g, "\\%");
  }

  /** @param {string} tex */
  function katexHostHtml(tex, displayMode) {
    const t = String(tex || "").trim();
    if (!t) return "<span></span>";
    const cls = displayMode ? "katex-host katex-display" : "katex-host";
    return '<span class="' + cls + '" data-katex="' + encodeURIComponent(t) + '"></span>';
  }

  /**
   * Dzieli LaTeX fiszki na linie: wzór, warunek w nawiasie, drugie równanie po `,\quad`.
   * @param {string} tex
   * @returns {{ type: "katex" | "hint", tex?: string, text?: string }[]}
   */
  function parseFlashFormulaLines(tex) {
    let t = String(tex || "").trim();
    if (!t) return [{ type: "katex", tex: "" }];

    t = t
      .replace(
        /\\quad\s*\(\s*s\\?\s*\\text\{\s*—\s*liczba współrzędnych[^}]*\}\s*\)\s*$/i,
        ""
      )
      .trim();

    let m = t.match(/^(.*)\\quad\s*\(\\text\{((?:[^{}]|\\[{}])+)\}\)\s*$/);
    if (m && m[1].trim() && m[2]) {
      return [
        { type: "katex", tex: m[1].trim() },
        { type: "hint", text: m[2] },
      ];
    }

    m = t.match(/^(.*)\\quad\s*\(([^()]*(?:\([^()]*\)[^()]*)*)\)(\^?\{?\d+\}?)?\s*$/);
    if (m && m[1].trim() && m[2].trim() && !/^\\text\{/.test(m[2].trim())) {
      const cond = "(" + m[2].trim() + ")" + (m[3] || "");
      return [
        { type: "katex", tex: m[1].trim() },
        { type: "katex", tex: cond },
      ];
    }

    const dual = t.match(/^(.*?)(?:,\\,|,)\\quad\s+([\s\S]+)$/);
    if (dual) {
      const a = dual[1].trim();
      const b = dual[2].trim();
      const hasAssign = (s) =>
        /(?:^|[^\\<>!])=(?![>])/.test(s) || /\\Delta\s*T\s*=/.test(s);
      const isRelation = (s) =>
        hasAssign(s) ||
        /\\(?:propto|perp|ll|gg|gtrless|approx|mp|pm)\b/.test(s) ||
        /\\angle\s*\(/.test(s);
      const isLabelPair = /\\text\{\s*—/.test(t);
      if (a && b && ((hasAssign(a) && isRelation(b)) || isLabelPair)) {
        return [
          { type: "katex", tex: a },
          { type: "katex", tex: b },
        ];
      }
    }

    return [{ type: "katex", tex: t }];
  }

  /**
   * @param {string} tex
   * @param {{ stackClass?: string, lineClass?: string, singleWrapClass?: string }} [opts]
   */
  function flashQuizFormulaBlockHtml(tex, opts) {
    const stackClass = (opts && opts.stackClass) || "quiz-formula-stack";
    const lineClass = (opts && opts.lineClass) || "quiz-formula-main";
    const lines = parseFlashFormulaLines(tex);
    if (lines.length <= 1 && lines[0].type === "katex") {
      const only = lines[0].tex || "";
      const wrap = (opts && opts.singleWrapClass) || "quiz-option-formula";
      return `<div class="sheet-formula ${wrap}">${katexHostHtml(only, false)}</div>`;
    }
    return (
      `<div class="${stackClass}">` +
      lines
        .map((ln) => {
          if (ln.type === "hint") {
            return `<p class="quiz-formula-hint">(${escapeHtml(ln.text || "")})</p>`;
          }
          return `<div class="sheet-formula ${lineClass}">${katexHostHtml(ln.tex || "", false)}</div>`;
        })
        .join("") +
      `</div>`
    );
  }

  function mountKatexIn(root) {
    if (!root || typeof root.querySelectorAll !== "function" || typeof window.katex === "undefined") {
      return;
    }
    root.querySelectorAll(".katex-host").forEach((el) => {
      const raw = el.getAttribute("data-katex");
      if (raw == null) return;
      try {
        const tex = decodeURIComponent(raw);
        el.textContent = "";
        window.katex.render(tex, el, {
          throwOnError: false,
          displayMode: el.classList.contains("katex-display"),
          strict: "ignore",
        });
      } catch (e) {
        el.textContent = decodeURIComponent(raw);
      }
    });
  }

  function queueMountKatex() {
    const appEl = document.getElementById("app");
    if (typeof queueMicrotask === "function") {
      queueMicrotask(() => mountKatexIn(appEl));
    } else {
      setTimeout(() => mountKatexIn(appEl), 0);
    }
  }

  /**
   * Notacja z treści zadań/fiszek → LaTeX (ułamki \dfrac, pierwiastki, indeksy, greka).
   * @param {string} raw
   * @returns {string}
   */
  function physicsPlainToLatex(raw) {
    let s = String(raw).trim();
    if (!s) return "";

    if (/\\[a-zA-Z]+/.test(s)) {
      return s.replace(/−/g, "-");
    }

    const IMPL = "<<IMPL>>";
    s = s.replace(/\s*⇒\s*/g, IMPL);

    s = s.replace(/−/g, "-");
    s = s.replace(/≈/g, "\\approx ");
    s = s.replace(/≤/g, "\\le ");
    s = s.replace(/≥/g, "\\ge ");
    s = s.replace(/(\d),(\d)/g, "$1.$2");

    s = s.replace(/Eₖ/g, "E_{k}");
    s = s.replace(/Eₚ/g, "E_{p}");

    for (let d = 0; d <= 9; d++) {
      const u = String.fromCharCode(0x2080 + d);
      s = s.replace(new RegExp("([A-Za-z])" + u, "g"), "$1_{" + d + "}");
      s = s.replace(new RegExp("([0-9\\)])" + u, "g"), "$1_{" + d + "}");
    }

    s = s.replace(/([A-Za-z])²/g, "$1^{2}");
    s = s.replace(/([0-9\)])²/g, "$1^{2}");
    s = s.replace(/([A-Za-z])³/g, "$1^{3}");
    s = s.replace(/([0-9\)])³/g, "$1^{3}");

    s = s.replace(/ρ/g, "\\rho");
    s = s.replace(/Δ/g, "\\Delta");
    s = s.replace(/μ/g, "\\mu");
    s = s.replace(/Ω/g, "\\Omega");
    s = s.replace(/π/g, "\\pi");

    s = s.replace(/·/g, "\\cdot ");
    s = s.replace(/×/g, "\\times ");

    for (let pass = 0; pass < 8; pass++) {
      const next = s.replace(/√\(([^()]*)\)/, "\\sqrt{$1}");
      if (next === s) break;
      s = next;
    }
    s = s.replace(/√([0-9.]+)/g, "\\sqrt{$1}");

    /** @param {string} str */
    function splitOnEqualsOutsideParens(str) {
      const out = [];
      let depth = 0;
      let buf = "";
      for (let i = 0; i < str.length; i++) {
        const c = str[i];
        if (c === "(") depth++;
        else if (c === ")") depth = Math.max(0, depth - 1);
        if (c === "=" && depth === 0) {
          out.push(buf.trim());
          buf = "";
        } else {
          buf += c;
        }
      }
      out.push(buf.trim());
      return out.filter(Boolean);
    }

    const segs = splitOnEqualsOutsideParens(s);
    s = segs
      .map((seg) => {
        if (seg.includes("\\dfrac") || seg.includes("\\frac") || seg.includes(IMPL)) return seg;
        if (!seg.includes("/")) return seg;
        const parts = seg.split(/\s*\/\s*/).map((p) => p.trim());
        if (parts.length === 1) return seg;
        if (parts.length === 2) {
          const m = parts[1].match(/^(\d+(?:\.\d+)?)\s+(\([^)]*\))\s*$/);
          if (m) {
            return "\\dfrac{" + parts[0] + "}{" + m[1] + "}\\quad " + m[2];
          }
        }
        return parts.reduce((a, b) => "\\dfrac{" + a + "}{" + b + "}");
      })
      .join(" = ");

    s = s.replace(new RegExp(IMPL, "g"), "\\Rightarrow ");
    return s.replace(/\s+/g, " ").trim();
  }

  /**
   * Fisher–Yates: miesza kopię tablicy (losowa pozycja poprawnej odpowiedzi w quizie).
   * @template T
   * @param {T[]} array
   * @returns {T[]}
   */
  function fisherYatesShuffle(array) {
    const a = array.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  /**
   * Quiz fiszek: jedna poprawna odpowiedź to `back` bieżącej karty; trzy pozostałe to losowe **inne wzory**
   * (pole `back` innych kart) z **tego samego działu** (`topic`). Gdy zabraknie puli — uzupełnienie z całego poziomu,
   * potem z `quizDistractors` w JSON, na końcu z globalnej listy `CARDS`.
   * @param {{ topic: string, front: string, back: string, quizDistractors?: string[] | null }} card
   * @returns {{ choices: string[], correctIndex: number }}
   */
  function buildFlashQuizChoices(card) {
    const norm = (x) => String(x).replace(/\s+/g, " ").trim();
    const correct = physicsPlainToLatex(String(card.back || "")).trim();
    const refKey = sheetCardRefKey(card);
    const levelCards = cardsForHomeLevel(homeLevelId);
    /** @type {string[]} */
    const wrongs = [];

    function tryAddBack(tex) {
      const w = physicsPlainToLatex(String(tex || "")).trim();
      if (!w || norm(w) === norm(correct)) return false;
      if (wrongs.some((u) => norm(u) === norm(w))) return false;
      wrongs.push(w);
      return true;
    }

    /** @param {{ topic: string, front: string, back: string }[]} candidates */
    function addFromCardBacks(candidates) {
      const shuffled = fisherYatesShuffle(candidates.slice());
      for (const o of shuffled) {
        if (wrongs.length >= 3) break;
        if (sheetCardRefKey(o) === refKey) continue;
        tryAddBack(o.back);
      }
    }

    addFromCardBacks(levelCards.filter((c) => c.topic === card.topic));
    addFromCardBacks(levelCards);
    const raw = Array.isArray(card.quizDistractors) ? card.quizDistractors : [];
    for (const d of raw) {
      if (wrongs.length >= 3) break;
      tryAddBack(d);
    }
    if (wrongs.length < 3) {
      addFromCardBacks(CARDS.filter((c) => sheetCardRefKey(c) !== refKey));
    }
    let pad = 0;
    while (wrongs.length < 3) {
      wrongs.push("\\text{·" + String(++pad) + "}");
    }

    const pool = [correct, ...wrongs.slice(0, 3)];
    const choices = fisherYatesShuffle(pool);
    let correctIndex = choices.findIndex((x) => norm(x) === norm(correct));
    if (correctIndex < 0) correctIndex = 0;
    return { choices, correctIndex };
  }

  /**
   * Czy zadanie wymaga bramki quizu (4 warianty formulaQuiz) — legacy.
   * @param {object} t
   */
  function taskNeedsQuizGate(t) {
    const fq = t && t.formulaQuiz;
    return Boolean(fq && Array.isArray(fq.choices) && fq.choices.length >= 4);
  }

  /**
   * Walidacja wyniku liczbowego (tolerancja 2%; przy exact=0 — bezwzględna 0,01).
   * @param {string} userInput
   * @param {string} exactValue
   */
  function checkMathAnswer(userInput, exactValue) {
    const strip = (s) => String(s ?? "").replace(/\s/g, "").replace(/,/g, ".");
    const user = parseFloat(strip(userInput));
    const exact = parseFloat(strip(exactValue));
    if (!Number.isFinite(user) || !Number.isFinite(exact)) return false;
    if (exact === 0) return Math.abs(user - exact) <= 0.01;
    return Math.abs((user - exact) / exact) <= 0.02;
  }

  /** @param {object} t @returns {"open"|"math"|"abcd"} */
  function getTaskType(t) {
    const tt = t && t.taskType;
    if (tt === "open" || tt === "math" || tt === "abcd") return tt;
    return "open";
  }

  /** Czy zadanie ma interaktywną bramkę (math / abcd / legacy formulaQuiz). */
  function taskHasInteractiveGate(t) {
    const type = getTaskType(t);
    if (type === "open") return taskNeedsQuizGate(t);
    if (type === "math") return String(t.mathValue ?? "").trim() !== "";
    if (type === "abcd") {
      const opts = t && t.abcdOptions;
      return Array.isArray(opts) && opts.length >= 4;
    }
    return false;
  }

  /** Czy zadanie wymaga odblokowania przed odpowiedzią / pełnym rozwiązaniem. */
  function taskNeedsAnswerGate(t) {
    return taskHasInteractiveGate(t);
  }

  /** @param {number | string | undefined} difficulty */
  function taskDifficultyStarsHtml(difficulty) {
    const n = Math.max(1, Math.min(3, Number(difficulty) || 1));
    const filled = "⭐".repeat(n);
    const empty = "☆".repeat(3 - n);
    return `<span class="task-difficulty-stars" aria-label="Poziom trudności ${n} z 3">${filled}${empty}</span>`;
  }

  function unlockTaskWithSolution() {
    taskQuizSolved = true;
    taskSolutionVisible = true;
    taskQuizUnlockAnim = true;
    render();
  }

  function celebrateSuccess() {
    if (typeof confetti === "function") {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  }

  /** @param {HTMLElement | null} el */
  function triggerTaskShake(el) {
    if (!el) return;
    el.classList.remove("shake");
    void el.offsetWidth;
    el.classList.add("shake");
    window.setTimeout(() => el.classList.remove("shake"), 400);
  }

  /**
   * 2-Strike: pierwszy błąd — wstrząs + podpowiedź; drugi — ujawnienie i odblokowanie.
   * @param {HTMLElement | null} shakeEl
   * @param {() => void} [onSecondStrike]
   */
  function handleTaskWrongAttempt(shakeEl, onSecondStrike) {
    taskAttempts += 1;
    if (taskAttempts === 1) {
      triggerTaskShake(shakeEl);
      render();
      return;
    }
    if (taskAttempts >= 2) {
      if (typeof onSecondStrike === "function") onSecondStrike();
      unlockTaskWithSolution();
    }
  }

  /**
   * Wiersz wzoru z opcjonalnym komentarzem po „—”.
   * @param {string} line
   */
  function formulaLineToLatex(line) {
    const m = String(line).split(/\s+—\s+/);
    const head = (m[0] || "").trim();
    const tail = m.slice(1).join(" — ").trim();
    if (tail === "" && /\\[a-zA-Z]+/.test(head)) {
      return head;
    }
    let tex = physicsPlainToLatex(head);
    if (tail) {
      tex += "\\quad\\text{(" + texText(tail) + ")}";
    }
    return tex;
  }

  /**
   * Fiszki z `data/fiszki-wzory.json` (ładowane w `boot`).
   * @type {{ topic: string, front: string, back: string, symbolLatex?: string | null, quizDistractors?: string[] | null }[]}
   */
  let CARDS = [];

  /** Separator klucza topic↔front (zgodny z `wzory-symbol-legends.js`). */
  const SHEET_CARD_REF_SEP = "\x1e";

  /**
   * Klucz mapy wzorów i legendy symboli: `topic` + SEP + `front`
   * (pole `front` w aplikacji = `name` z `data/fiszki-wzory.json` — identycznie jak w `wzory-symbol-legends.js`).
   * @param {string} topic
   * @param {string} frontOrName
   */
  function sheetSymbolLegendKey(topic, frontOrName) {
    return String(topic || "").trim() + SHEET_CARD_REF_SEP + String(frontOrName || "").trim();
  }

  /** Mapa: topic + SEP + front → treść wzoru z karty (LaTeX). */
  const SHEET_CARD_BACK_MAP = Object.create(null);

  function rebuildSheetCardBackMap() {
    for (const k of Object.keys(SHEET_CARD_BACK_MAP)) {
      delete SHEET_CARD_BACK_MAP[k];
    }
    for (const c of CARDS) {
      SHEET_CARD_BACK_MAP[sheetSymbolLegendKey(c.topic, c.front)] = c.back;
    }
  }

  /** Tablica stringów z JSON lub po edycji w Decap CMS (obiekty { latex, step, … }). */
  function normalizeJsonStringList(arr) {
    if (!Array.isArray(arr)) return null;
    const out = arr
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") {
          const v = item.latex ?? item.step ?? item.value ?? item.distractor ?? item.item;
          return v != null ? String(v).trim() : "";
        }
        return "";
      })
      .filter(Boolean);
    return out.length ? out : null;
  }

  async function loadFiszkiWzory() {
    const res = await fetch("data/fiszki-wzory.json");
    if (!res.ok) throw new Error("HTTP " + res.status + " — data/fiszki-wzory.json");
    const data = await res.json();
    const rows = Array.isArray(data.cards) ? data.cards : [];
    if (rows.length === 0) throw new Error("Brak wpisów cards w data/fiszki-wzory.json");
    CARDS = rows.map((row) => ({
      topic: String(row.topic || ""),
      front: String(row.name || ""),
      back: String(row.correct_latex || "").trim(),
      scope: row.scope === "podstawowka" ? "podstawowka" : "cke",
      showSp: row.showSp !== false,
      symbolLatex: row.symbol != null && String(row.symbol).trim() ? String(row.symbol).trim() : null,
      quizDistractors: normalizeJsonStringList(row.distractors),
    }));
    rebuildSheetCardBackMap();
  }

  /**
   * Klucz fiszki (topic + separator + front) — spójny z mapą odsyłaczy w zadaniach.
   * @param {{ topic: string, front: string }} card
   */
  function sheetCardRefKey(card) {
    return sheetSymbolLegendKey(card.topic, card.front);
  }

  /** Tematy wzorów dostępne wyłącznie na poziomie „Liceum — rozszerzenie”. */
  const WZORY_ROZ_ONLY_TOPICS = new Set([
    "Elementy mechaniki relatywistycznej",
    "Wybrane stałe i parametry astrofizyczne",
  ]);

  /** Pojedyncze wzory wyłączone z „Liceum — podstawa” (reszta z tematu zostaje). */
  const WZORY_EXCLUDE_LO_P_CARD_KEYS = new Set(
    [
      ["Grawitacja i elementy astronomii", "Prawo Hubble'a"],
      ["Drgania, fale mechaniczne i świetlne", "Doppler (światło) — przybliżenie, źródło oddala się"],
      ["Drgania, fale mechaniczne i świetlne", "Doppler (światło) — przybliżenie, źródło zbliża się"],
      ["Drgania, fale mechaniczne i świetlne", "Doppler — wzory ścisłe (dźwięk i światło, kierunek prędkości źródła)"],
      ["Elementy fizyki atomowej i jądrowej", "Długość fali de Broglie'a"],
    ].map((pair) => sheetSymbolLegendKey(pair[0], pair[1]))
  );

  /**
   * @param {{ topic: string, front: string, scope?: string, showSp?: boolean }} card
   * @param {string} homeLevelId
   */
  function cardVisibleForHomeLevel(card, homeLevelId) {
    const scope = card.scope === "podstawowka" ? "podstawowka" : "cke";

    if (homeLevelId === "lo-rozszerzenie") {
      return scope === "cke";
    }

    if (homeLevelId === "lo-podstawa" || homeLevelId === "sp") {
      if (scope !== "podstawowka") return false;
      if (WZORY_ROZ_ONLY_TOPICS.has(card.topic)) return false;
      if (homeLevelId === "lo-podstawa" && WZORY_EXCLUDE_LO_P_CARD_KEYS.has(sheetCardRefKey(card))) {
        return false;
      }
      if (homeLevelId === "sp" && card.showSp === false) return false;
      return true;
    }

    return scope === "cke";
  }

  /**
   * Fiszki / karta wzorów — tylko wzory dla wybranego poziomu w menu głównym.
   * @param {string} homeLevelId
   * @returns {{ topic: string, front: string, back: string }[]}
   */
  function cardsForHomeLevel(homeLevelId) {
    return CARDS.filter((c) => cardVisibleForHomeLevel(c, homeLevelId));
  }

  /**
   * @param {{ sheetCardRefs?: (string|[string, string])[] }} t
   * @returns {string[]}
   */
  function sheetRefKeysFromTask(t) {
    const raw = t.sheetCardRefs;
    if (!Array.isArray(raw)) return [];
    const keys = [];
    for (const item of raw) {
      if (typeof item === "string") keys.push(item);
      else if (Array.isArray(item) && item.length >= 2) keys.push(sheetSymbolLegendKey(item[0], item[1]));
    }
    return keys.filter(Boolean);
  }

  /**
   * Wiersze wzorów z karty (CKE) dla zadania: najpierw odsyłacze do fiszek, potem ewentualne `sheetFormulas`.
   * @param {{ sheetCardRefs?: (string|[string, string])[], sheetFormulas?: string[] }} t
   * @returns {string[]}
   */
  function getTaskSheetLines(t) {
    const out = [];
    for (const key of sheetRefKeysFromTask(t)) {
      const b = SHEET_CARD_BACK_MAP[key];
      if (typeof b === "string" && b.trim()) out.push(b);
    }
    if (Array.isArray(t.sheetFormulas)) {
      for (const line of t.sheetFormulas) {
        if (line) out.push(line);
      }
    }
    return out;
  }

  /**
   * @typedef {{ title: string, question: string, answer: string, difficulty?: number|string, taskType?: "open"|"math"|"abcd", mathValue?: string, mathUnit?: string, abcdOptions?: { text: string, isCorrect?: boolean }[], formulas?: string[], sheetFormulas?: string[], sheetCardRefs?: (string|[string, string])[], laws?: string[], solutionSteps?: string[], formulaQuiz?: { lhsLatex?: string, prompt?: string, choices?: { katex: string, correct?: boolean, distractorRationale?: string }[] } }} Task
   * @typedef {{ id: string, title: string, tasks?: Task[], children?: TopicSection[], sectionRef?: string, sectionRefs?: string[] }} TopicSection
   * @typedef {{ id: string, title: string, sections: TopicSection[], curriculum?: TopicSection[] }} SchoolLevel
   */

  /**
   * Poziomy i zadania — plik zadania.json (ładowane w loadZadaniaJson / boot).
   * @type {SchoolLevel[]}
   */
  let TASK_LEVELS = [];

  /** Kolejność poziomów na górnym pasku menu: liceum rozszerzone → liceum podstawa → szkoła podstawowa. */
  const HOME_LEVEL_TAB_ORDER = ["lo-rozszerzenie", "lo-podstawa", "sp"];

  /** Etykiety, gdy `TASK_LEVELS` jeszcze nie ma wpisu (np. błąd ładowania `zadania.json`). */
  const HOME_LEVEL_FALLBACK_TITLES = {
    "lo-rozszerzenie": "Liceum — rozszerzenie",
    "lo-podstawa": "Liceum — podstawa",
    sp: "Szkoła podstawowa",
  };

  /** Oficjalna karta wzorów fizyki dla SP (PDF poza repo — otwarcie w nowej karcie). */
  const SP_OFFICIAL_SHEET_PDF_URL =
    "https://www.sp-sobienie.pl/images/sampledata/WZORY/wzory%20fizyka.pdf";

  /** Onboarding: typ szkoły → `homeLevelId` w danych. */
  const USER_LEVEL_TO_HOME = {
    sp: "sp",
    "lo-p": "lo-podstawa",
    "lo-r": "lo-rozszerzenie",
  };

  const USER_LEVEL_SHORT_LABELS = {
    sp: "SP",
    "lo-p": "LO Podst.",
    "lo-r": "LO Rozsz.",
  };

  const ONBOARDING_SCHOOL_OPTIONS = [
    { id: "sp", title: "Szkoła podstawowa" },
    { id: "lo-p", title: "Liceum — podstawa" },
    { id: "lo-r", title: "Liceum — rozszerzenie" },
  ];

  /** Etykiety w modalu profilu ucznia (`#student-level-select`). */
  const STUDENT_LEVEL_SELECT_OPTIONS = [
    { id: "sp", title: "Szkoła podstawowa" },
    { id: "lo-p", title: "Liceum podstawa" },
    { id: "lo-r", title: "Liceum rozszerzenie" },
  ];

  const FIZKI_CONFIG_STORAGE_KEY = "fizki_config";

  function orderedHomeLevelIds() {
    return HOME_LEVEL_TAB_ORDER.slice();
  }

  /** @param {string} ul */
  function homeLevelIdFromUserLevel(ul) {
    return USER_LEVEL_TO_HOME[ul] || USER_LEVEL_TO_HOME["lo-r"];
  }

  /** @returns {string} */
  function getEffectiveClassFilterId() {
    return userGrade === "all" ? "" : String(userGrade || "").trim();
  }

  function applyFizkiConfig() {
    homeLevelId = homeLevelIdFromUserLevel(userLevel);
    const level = getLevel(homeLevelId);
    if (userGrade !== "all") {
      const node =
        level && level.curriculum ? findCurriculumNodeById(level.curriculum, userGrade) : null;
      if (!node || !hasNodeChildren(node)) {
        userGrade = "all";
      }
    }
    taskClassTabId = getEffectiveClassFilterId();
    updateAppBreadcrumb();
    updateStudentDashboard();
  }

  /**
   * @param {string} [level]
   * @param {string} [grade]
   */
  function saveFizkiConfig(level, grade) {
    if (typeof level === "string" && Object.prototype.hasOwnProperty.call(USER_LEVEL_TO_HOME, level)) {
      userLevel = level;
    }
    if (typeof grade === "string") {
      userGrade = grade.trim() || "all";
    }
    localStorage.setItem(
      FIZKI_CONFIG_STORAGE_KEY,
      JSON.stringify({ userLevel, userGrade })
    );
    applyFizkiConfig();
  }

  /** @returns {boolean} */
  function loadFizkiConfig() {
    try {
      const raw = JSON.parse(localStorage.getItem(FIZKI_CONFIG_STORAGE_KEY) || "null");
      if (!raw || typeof raw !== "object") return false;
      const ul = String(raw.userLevel || "").trim();
      const ug = String(raw.userGrade ?? "all").trim() || "all";
      if (!Object.prototype.hasOwnProperty.call(USER_LEVEL_TO_HOME, ul)) return false;
      userLevel = ul;
      userGrade = ug;
      applyFizkiConfig();
      return true;
    } catch {
      return false;
    }
  }

  function updateAppBreadcrumb() {
    const el = document.getElementById("app-mini-breadcrumb");
    if (el) el.hidden = true;
  }

  /** @param {string} ul */
  function fillStudentGradeSelect(ul) {
    const gradeSelect = document.getElementById("student-grade-select");
    if (!(gradeSelect instanceof HTMLSelectElement)) return;
    const gradeOpts = gradeOptionsForUserLevel(ul);
    gradeSelect.innerHTML = gradeOpts
      .map((o) => `<option value="${escapeHtml(o.id)}">${escapeHtml(o.title)}</option>`)
      .join("");
    const validGrade = gradeOpts.some((o) => o.id === userGrade);
    gradeSelect.value = validGrade ? userGrade : "all";
    if (!validGrade) userGrade = "all";
  }

  function updateStudentDashboard() {
    const levelSelect = document.getElementById("student-level-select");
    const gradeSelect = document.getElementById("student-grade-select");
    if (!(levelSelect instanceof HTMLSelectElement) || !(gradeSelect instanceof HTMLSelectElement)) {
      return;
    }

    levelSelect.innerHTML = STUDENT_LEVEL_SELECT_OPTIONS.map(
      (o) => `<option value="${escapeHtml(o.id)}">${escapeHtml(o.title)}</option>`
    ).join("");
    const validLevel = STUDENT_LEVEL_SELECT_OPTIONS.some((o) => o.id === userLevel);
    levelSelect.value = validLevel ? userLevel : "lo-r";

    fillStudentGradeSelect(levelSelect.value);
  }

  function onStudentLevelSelectChange() {
    const levelSelect = document.getElementById("student-level-select");
    if (!(levelSelect instanceof HTMLSelectElement)) return;
    const newLevel = levelSelect.value;
    saveFizkiConfig(newLevel, "all");
    applyFizkiConfig();
    fillStudentGradeSelect(newLevel);
    render();
  }

  function onStudentGradeSelectChange() {
    const gradeSelect = document.getElementById("student-grade-select");
    if (!(gradeSelect instanceof HTMLSelectElement)) return;
    const newGrade = gradeSelect.value;
    saveFizkiConfig(userLevel, newGrade);
    applyFizkiConfig();
    render();
  }

  function userGradeDisplayLabel() {
    if (userGrade === "all") return "Wszystko";
    const level = getLevel(homeLevelIdFromUserLevel(userLevel));
    if (!level || !level.curriculum) return userGrade;
    const node = findCurriculumNodeById(level.curriculum, userGrade);
    if (node && node.title && String(node.title).trim()) return String(node.title).trim();
    return userGrade;
  }

  /**
   * @param {string} ul — sp | lo-p | lo-r
   * @returns {{ id: string, title: string }[]}
   */
  function gradeOptionsForUserLevel(ul) {
    const hid = homeLevelIdFromUserLevel(ul);
    const level = getLevel(hid);
    const roots = level ? curriculumVisibleClassRoots(level) : [];
    /** @type {{ id: string, title: string }[]} */
    const opts = [{ id: "all", title: "Wszystko" }];
    for (const r of roots) {
      const title = r.title != null && String(r.title).trim() ? String(r.title) : String(r.id || "");
      opts.push({ id: String(r.id || ""), title });
    }
    return opts;
  }

  function installAppBreadcrumbDelegation() {
    if (document.documentElement.dataset.breadcrumbDelegation === "1") return;
    document.documentElement.dataset.breadcrumbDelegation = "1";
  }

  function renderOnboardingSchoolHtml() {
    const opts = ONBOARDING_SCHOOL_OPTIONS.map(
      (o) =>
        `<button type="button" class="onboarding-option" data-onboarding-school="${escapeHtml(o.id)}">${escapeHtml(o.title)}</button>`
    ).join("");
    return `<div class="onboarding" aria-labelledby="onboarding-school-title">
      <h2 id="onboarding-school-title" class="onboarding-title">Gdzie się uczysz?</h2>
      <p class="onboarding-sub">Wybierz typ szkoły — w kolejnym kroku wskażesz klasę.</p>
      <div class="onboarding-options">${opts}</div>
    </div>`;
  }

  function renderOnboardingGradeHtml() {
    const school = ONBOARDING_SCHOOL_OPTIONS.find((o) => o.id === _pendingOnboardingLevel);
    const schoolTitle = school ? school.title : "";
    const grades = gradeOptionsForUserLevel(_pendingOnboardingLevel);
    const opts = grades
      .map(
        (g) =>
          `<button type="button" class="onboarding-option" data-onboarding-grade="${escapeHtml(g.id)}">${escapeHtml(g.title)}</button>`
      )
      .join("");
    return `<div class="onboarding" aria-labelledby="onboarding-grade-title">
      <h2 id="onboarding-grade-title" class="onboarding-title">Która klasa?</h2>
      <p class="onboarding-sub">${escapeHtml(schoolTitle)} — możesz ograniczyć treść do jednej klasy lub wybrać wszystko.</p>
      <div class="onboarding-options">${opts}</div>
    </div>`;
  }

  /** Liście planu programu → id sekcji z zadaniami w `level.sections` (można podać kilka). */
  const LO_RZ_CURRICULUM_LINKS = {
    "lo-rz-k1-kin-1": ["lo1-wektory"],
    "lo-rz-k1-kin-2": ["lo1-ruch-jednostajny"],
    "lo-rz-k1-kin-3": ["lo1-wielkosci-ruchu", "lo1-ruch-przyspieszony"],
    "lo-rz-k1-kin-4": ["lo1-ruch-zmienny"],
    "lo-rz-k1-kin-5": ["lo1-ruch-2d"],
    "lo-rz-k1-kin-6": ["lo1-wzglednosc"],
    "lo-rz-k1-dyn-2": ["lo1-newton"],
    "lo-rz-k1-dyn-4": ["lo1-ped-impuls", "lo1-zach-pedu"],
    "lo-rz-k1-dyn-5": ["lo1-tarcie"],
    "lo-rz-k1-dyn-6": ["lo1-okrag-nieinercja"],
    "lo-rz-k1-pme-1": ["lo1-praca-moc-em"],
    "lo-rz-k1-pme-5": ["lo1-zee-zderzenia"],
    "lo-rz-k1-hyd-1": ["lo1-hydrostatyka"],
    "lo-rz-k2-ter-4": ["lo1-termodynamika-mini"],
    "lo-rz-k3-mag-3": ["lo1-elektro-magnes"],
  };

  const LO_P_CURRICULUM_LINKS = {
    "lo-p-k1-kin-2": ["ruch"],
    "lo-p-k1-dyn-2": ["dynamika"],
    "lo-p-k2-pme-1": ["energia"],
    "lo-p-k2-hyd-1": ["hydrostatyka"],
    "lo-p-k3-ele-3": ["elektryczność"],
  };

  const SP_CURRICULUM_LINKS = {
    "sp-k7-kin-2": ["ruch"],
    "sp-k7-dyn-3": ["dynamika"],
    "sp-k7-pme-1": ["praca-sp"],
    "sp-k7-w-4": ["wstep-sp"],
    "sp-k8-prad-3": ["prad-sp"],
  };

  /** Zadania wyłącznie z `zadania.json` w katalogu głównym (bramka `formulaQuiz` w `task-detail`). */
  async function loadZadaniaJson() {
    const res = await fetch("zadania.json");
    if (!res.ok) throw new Error("HTTP " + res.status + " — zadania.json");
    const data = await res.json();
    const levels = Array.isArray(data)
      ? data
      : Array.isArray(data?.levels)
        ? data.levels
        : [];
    if (levels.length === 0) throw new Error("zadania.json: brak poziomów (levels)");
    for (const lvl of levels) {
      lvl.sections = Array.isArray(lvl.sections) ? lvl.sections : [];
      for (const sec of lvl.sections) {
        sec.tasks = Array.isArray(sec.tasks) ? sec.tasks : [];
        sec.tasks = sec.tasks.filter((task) => {
          if (Array.isArray(task.formulas)) {
            task.formulas = normalizeJsonStringList(task.formulas) || [];
          }
          if (Array.isArray(task.solutionSteps)) {
            task.solutionSteps = normalizeJsonStringList(task.solutionSteps) || [];
          }
          return taskHasInteractiveGate(task);
        });
      }
    }
    TASK_LEVELS = levels;
  }

  const CURRICULUM_FILES = {
    "lo-rozszerzenie": "data/curriculum-lo-rozszerzenie.json",
    "lo-podstawa": "data/curriculum-lo-podstawa.json",
    sp: "data/curriculum-sp.json",
  };

  const CURRICULUM_LINKS_BY_LEVEL = {
    "lo-rozszerzenie": LO_RZ_CURRICULUM_LINKS,
    "lo-podstawa": LO_P_CURRICULUM_LINKS,
    sp: SP_CURRICULUM_LINKS,
  };

  function pushSectionRefToLeaf(level, leafId, sectionId) {
    const node = findCurriculumNodeById(level.curriculum, leafId);
    if (!node) return;
    node.sectionRefs = node.sectionRefs || [];
    if (!node.sectionRefs.includes(sectionId)) node.sectionRefs.push(sectionId);
  }

  function augmentGeminiCurriculumRefs(level) {
    if (!level.curriculum) return;
    if (level.id === "lo-rozszerzenie") {
      const pairs = [
        ["dynamika-lo", "lo-rz-k1-dyn-4"],
        ["ruch-po-okregu-lo", "lo-rz-k2-bry-2"],
        ["praca-moc-energia", "lo-rz-k1-pme-1"],
        ["termodynamika-lo", "lo-rz-k2-ter-4"],
        ["elektrycznosc-lo", "lo-rz-k3-mag-3"],
      ];
      for (const [sid, leafId] of pairs) {
        if (level.sections.some((s) => s.id === sid)) pushSectionRefToLeaf(level, leafId, sid);
      }
    }
    if (level.id === "sp" && level.sections.some((s) => s.id === "praca-energia-sp")) {
      pushSectionRefToLeaf(level, "sp-k7-pme-5", "praca-energia-sp");
    }
  }

  /** @param {TopicSection[]} nodes */
  /** @param {Set<string>} into */
  function collectUsedSectionIds(nodes, into) {
    for (const n of nodes || []) {
      getLeafSectionRefs(n).forEach((id) => into.add(id));
      if (n.children) collectUsedSectionIds(n.children, into);
    }
  }

  function syncCurriculumImportFolder(level) {
    if (!level.curriculum || !Array.isArray(level.sections)) return;
    const used = new Set();
    collectUsedSectionIds(level.curriculum, used);
    const folder =
      findCurriculumNodeById(level.curriculum, "lo-rz-import") ||
      findCurriculumNodeById(level.curriculum, "lo-p-import") ||
      findCurriculumNodeById(level.curriculum, "sp-import");
    if (!folder) return;
    const unmapped = level.sections.filter((s) => !used.has(s.id));
    folder.children = unmapped.map((s) => ({
      id: "imp-" + s.id,
      title: s.title,
      sectionRef: s.id,
    }));
  }

  function applyStaticCurriculumLinks(level) {
    const links = CURRICULUM_LINKS_BY_LEVEL[level.id];
    if (!level.curriculum || !links) return;
    for (const leafId of Object.keys(links)) {
      const node = findCurriculumNodeById(level.curriculum, leafId);
      if (node) node.sectionRefs = links[leafId].slice();
    }
  }

  /**
   * Liście programu bez wpisu w `*_CURRICULUM_LINKS` dostają zbiorcze `sectionRefs`,
   * żeby pod poziomami **lo-podstawa** / **sp** lista zadań nie była pusta (treść sekcji rośnie w `zadania.json`).
   */
  function applyHeuristicCurriculumSectionRefs(level) {
    if (!level.curriculum || !Array.isArray(level.sections)) return;
    const known = new Set(level.sections.map((s) => s.id));

    /** @param {TopicSection[]} nodes */
    function walk(nodes) {
      for (const node of nodes || []) {
        if (hasNodeChildren(node)) {
          walk(node.children);
          continue;
        }
        const id = String(node.id || "");
        if (!id || id.endsWith("-import") || id.startsWith("imp-")) continue;
        if (getLeafSectionRefs(node).length) continue;
        let ref = "";
        if (level.id === "lo-podstawa") {
          if (/^lo-p-k1-kin-/.test(id)) ref = "ruch";
          else if (/^lo-p-k1-dyn-/.test(id)) ref = "dynamika";
          else if (/^lo-p-k1-gra-/.test(id)) ref = "grawitacja";
          else if (/^lo-p-k2-pme-/.test(id)) ref = "energia";
          else if (/^lo-p-k2-hyd-/.test(id)) ref = "hydrostatyka";
          else if (/^lo-p-k2-ter-/.test(id)) ref = "termodynamika";
          else if (/^lo-p-k3-fal-/.test(id)) ref = "fale";
          else if (/^lo-p-k3-ele-/.test(id)) ref = "elektryczność";
          else if (/^lo-p-k3-mag-/.test(id)) ref = "magnetyzm";
          else if (/^lo-p-k3-opt-/.test(id)) ref = "optyka";
          else if (/^lo-p-k3-ja-/.test(id)) ref = "jadro";
        } else if (level.id === "sp") {
          if (/^sp-k7-w-/.test(id)) ref = "wstep-sp";
          else if (/^sp-k7-kin-/.test(id)) ref = "ruch";
          else if (/^sp-k7-dyn-/.test(id)) ref = "dynamika";
          else if (/^sp-k7-pme-/.test(id)) ref = "praca-sp";
          else if (/^sp-k7-hyd-/.test(id)) ref = "hydrostatyka";
          else if (/^sp-k7-ter-/.test(id)) ref = "termodynamika";
          else if (/^sp-k8-el-/.test(id)) ref = "elektrostatyka-sp";
          else if (/^sp-k8-prad-/.test(id)) ref = "prad-sp";
          else if (/^sp-k8-mag-/.test(id)) ref = "magnetyzm-sp";
          else if (/^sp-k8-fal-/.test(id)) ref = "fale-sp";
          else if (/^sp-k8-opt-/.test(id)) ref = "optyka-sp";
        }
        if (ref && known.has(ref)) node.sectionRefs = [ref];
      }
    }
    walk(level.curriculum);
  }

  /**
   * Stare pliki JSON mogły używać klucza `t` zamiast `title` (węzły folderów).
   * @param {TopicSection[] | undefined} nodes
   */
  function normalizeCurriculumNodes(nodes) {
    if (!nodes) return;
    for (const n of nodes) {
      if ((n.title == null || n.title === "") && n.t != null) n.title = n.t;
      delete n.t;
      if (n.children) normalizeCurriculumNodes(n.children);
    }
  }

  /**
   * Wymagane plany programu (JSON). Błąd sieci lub HTTP → wyjątek dla ekranu błędu boot.
   */
  async function loadCurriculaAndLinks() {
    for (const lvl of TASK_LEVELS) {
      const url = CURRICULUM_FILES[lvl.id];
      if (!url) continue;
      const res = await fetch(url);
      if (!res.ok) throw new Error("HTTP " + res.status + " dla " + url);
      const data = await res.json();
      if (data.curriculum) lvl.curriculum = data.curriculum;
      if (lvl.curriculum) {
        normalizeCurriculumNodes(lvl.curriculum);
        applyStaticCurriculumLinks(lvl);
        augmentGeminiCurriculumRefs(lvl);
        applyHeuristicCurriculumSectionRefs(lvl);
        syncCurriculumImportFolder(lvl);
      }
    }
  }

  function showAppLoadingState() {
    const el = document.getElementById("app");
    if (!el) return;
    el.innerHTML =
      '<div class="app-loading" role="status" aria-live="polite" aria-busy="true">Ładowanie danych...</div>';
  }

  function showAppBootError() {
    const el = document.getElementById("app");
    if (!el) return;
    el.innerHTML = `
      <div class="app-boot-error">
        <p class="flash-complete-title">Nie udało się pobrać danych. Odśwież stronę.</p>
        <button type="button" class="btn" id="btn-reload-app">Odśwież stronę</button>
      </div>`;
    const b = document.getElementById("btn-reload-app");
    if (b) b.onclick = () => location.reload();
  }

  function initTheme() {
    const savedTheme = localStorage.getItem("fizki_theme") || "dark";
    document.documentElement.dataset.theme = savedTheme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", savedTheme === "light" ? "#f4f4f9" : "#121212");
  }

  async function boot() {
    initTheme();
    showAppLoadingState();
    try {
      await loadFiszkiWzory();
      await loadZadaniaJson();
      await loadCurriculaAndLinks();
      installAppRootDelegation();
      installAppBreadcrumbDelegation();
      if (!loadFizkiConfig()) {
        screen = "onboarding-school";
      }
      render();
      if (screen !== "onboarding-school" && screen !== "onboarding-grade") {
        history.replaceState(appHistoryState(), "", "");
      }
    } catch (e) {
      console.error(e);
      showAppBootError();
    }
  }

  const app = document.getElementById("app");

  /** Ostatnie wymiary pill zakładek (przetrwają `innerHTML` w `render`). */
  const sliderPositionsCache = {};

  /** @type {null | 'student' | 'teacher'} */
  let mockUserRole = null;
  /** @type {ReturnType<typeof setTimeout> | null} */
  let quizToastTimerId = null;
  const COPY_CLASS_CODE_BTN_LABEL = "📋 Kod";
  const QUIZ_TOAST_DEFAULT_MESSAGE =
    "✅ Wygenerowano link do kartkówki! Skopiowano do schowka.";
  /** @type {ReturnType<typeof setTimeout> | null} */
  let copyClassCodeTimerId = null;

  /** @param {HTMLElement | null} el @param {boolean} visible */
  function setShellVisible(el, visible) {
    if (!(el instanceof HTMLElement)) return;
    el.classList.toggle("hidden", !visible);
    el.hidden = !visible;
  }

  function syncRoleMockUi() {
    setShellVisible(document.getElementById("app-auth-login"), mockUserRole === null);
    setShellVisible(document.getElementById("profile-student"), mockUserRole === "student");
    setShellVisible(document.getElementById("profile-teacher"), mockUserRole === "teacher");
    syncTeacherTaskTools();
  }

  function syncTeacherTaskTools() {
    const tools = document.getElementById("teacher-task-tools");
    if (!tools) return;
    const show =
      mockUserRole === "teacher" &&
      (screen === "task-chapters" || screen === "task-detail");
    setShellVisible(tools, show);
  }

  /** @param {HTMLElement | null} quizCreatorModal */
  function openQuizCreatorModal(quizCreatorModal) {
    const modal = quizCreatorModal || document.getElementById("quiz-creator-modal");
    if (!modal) return;
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("login-modal-open");
    const closeBtn = document.getElementById("quiz-creator-close");
    if (closeBtn instanceof HTMLElement) closeBtn.focus();
  }

  /** @param {HTMLElement | null} quizCreatorModal */
  function closeQuizCreatorModal(quizCreatorModal) {
    const modal = quizCreatorModal || document.getElementById("quiz-creator-modal");
    if (!modal) return;
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("login-modal-open");
  }

  /** @param {string} message */
  function showToast(message) {
    const toast = document.getElementById("quiz-success-toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove("hidden");
    if (quizToastTimerId) clearTimeout(quizToastTimerId);
    quizToastTimerId = setTimeout(() => {
      toast.classList.add("hidden");
      toast.textContent = QUIZ_TOAST_DEFAULT_MESSAGE;
      quizToastTimerId = null;
    }, 3000);
  }

  function showQuizSuccessToast() {
    showToast(QUIZ_TOAST_DEFAULT_MESSAGE);
  }

  function handleLoginStudent() {
    mockUserRole = "student";
    syncRoleMockUi();
    updateStudentDashboard();
  }

  function handleLoginTeacher() {
    mockUserRole = "teacher";
    syncRoleMockUi();
  }

  /** @param {HTMLElement | null} studentModal */
  function openStudentModal(studentModal) {
    const modal = studentModal || document.getElementById("student-dashboard");
    if (!modal) return;
    updateStudentDashboard();
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("login-modal-open");
    const closeBtn = document.getElementById("student-modal-close");
    if (closeBtn instanceof HTMLElement) closeBtn.focus();
  }

  /** @param {HTMLElement | null} studentModal */
  function closeStudentModal(studentModal) {
    const modal = studentModal || document.getElementById("student-dashboard");
    if (!modal) return;
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("login-modal-open");
  }

  /** @param {HTMLElement | null} teacherDashboardModal */
  function openTeacherDashboardModal(teacherDashboardModal) {
    const modal = teacherDashboardModal || document.getElementById("teacher-dashboard");
    if (!modal) return;
    resetTeacherDashboardView();
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("login-modal-open");
    const closeBtn = document.getElementById("teacher-dashboard-close");
    if (closeBtn instanceof HTMLElement) closeBtn.focus();
  }

  function resetTeacherDashboardView() {
    const tViewMain = document.getElementById("t-view-main");
    const tViewClassDetail = document.getElementById("t-view-class-detail");
    if (tViewMain) tViewMain.classList.remove("hidden");
    if (tViewClassDetail) {
      tViewClassDetail.classList.add("hidden");
      tViewClassDetail.setAttribute("aria-hidden", "true");
    }
    document.querySelectorAll("#t-view-class-detail .t-student-header").forEach((header) => {
      header.classList.remove("is-open");
    });
    document.querySelectorAll("#t-view-class-detail .t-student-body").forEach((body) => {
      body.classList.add("hidden");
    });
  }

  /** @param {HTMLElement | null} teacherDashboardModal */
  function closeTeacherDashboardModal(teacherDashboardModal) {
    const modal = teacherDashboardModal || document.getElementById("teacher-dashboard");
    if (!modal) return;
    resetTeacherDashboardView();
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("login-modal-open");
  }

  /** @param {HTMLElement | null} loginModal */
  function openLoginModal(loginModal) {
    const modal = loginModal || document.getElementById("login-modal");
    if (!modal) return;
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("login-modal-open");
    const closeBtn = document.getElementById("login-modal-close");
    if (closeBtn instanceof HTMLElement) closeBtn.focus();
  }

  /** @param {HTMLElement | null} loginModal */
  function closeLoginModal(loginModal) {
    const modal = loginModal || document.getElementById("login-modal");
    if (!modal) return;
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("login-modal-open");
  }

  function resetMockAuth() {
    mockUserRole = null;
    if (quizToastTimerId) {
      clearTimeout(quizToastTimerId);
      quizToastTimerId = null;
    }
    const toast = document.getElementById("quiz-success-toast");
    if (toast) {
      toast.classList.add("hidden");
      toast.textContent = QUIZ_TOAST_DEFAULT_MESSAGE;
    }
    if (copyClassCodeTimerId) {
      clearTimeout(copyClassCodeTimerId);
      copyClassCodeTimerId = null;
    }
    const btnCopyClassCode = document.getElementById("btn-copy-class-code");
    if (btnCopyClassCode instanceof HTMLButtonElement) {
      btnCopyClassCode.disabled = false;
      btnCopyClassCode.textContent = COPY_CLASS_CODE_BTN_LABEL;
    }
    const inputJoinCode = document.getElementById("input-join-code");
    if (inputJoinCode instanceof HTMLInputElement) inputJoinCode.value = "";
    closeLoginModal();
    closeStudentModal();
    closeTeacherDashboardModal();
    closeQuizCreatorModal();
    syncRoleMockUi();
  }

  /** @type {'main' | 'flash-study' | 'flash-complete' | 'task-chapters' | 'task-detail' | 'onboarding-school' | 'onboarding-grade'} */
  let screen = "main";
  /** @type {'fiszki' | 'zadania' | 'karta-wzorow'} */
  let mainTab = "fiszki";

  /** Id poziomu z `TASK_LEVELS` — pochodne z `userLevel` (`applyFizkiConfig`). */
  let homeLevelId = "lo-rozszerzenie";

  /** Onboarding: typ szkoły (sp | lo-p | lo-r). */
  let userLevel = "lo-r";
  /** `all` lub id węzła klasy z planu (`curriculum`, np. `lo-rz-k1`). */
  let userGrade = "all";
  /** Tymczasowy wybór szkoły między krokami onboardingu. */
  let _pendingOnboardingLevel = "";

  /** Indeks działu (topic) na karcie wzorów — zapamiętywany przy przełączaniu zakładek. */
  let sheetTopicIndex = 0;

  let flashIndex = 0;
  let deck = [];

  /** @type {number | null} wybrany wariant quizu fiszek (0–3), null przed odpowiedzią */
  let flashQuizPicked = null;
  /** @type {{ index: number, choices: string[], correctIndex: number } | null} */
  let flashQuizCache = null;
  /** @type {ReturnType<typeof setTimeout> | null} auto-advance po poprawnej odpowiedzi */
  let flashAutoAdvanceTimerId = null;

  function clearFlashAutoAdvanceTimer() {
    if (flashAutoAdvanceTimerId !== null) {
      clearTimeout(flashAutoAdvanceTimerId);
      flashAutoAdvanceTimerId = null;
    }
  }

  /** Przejście do następnej fiszki lub ekranu ukończenia (jak „Dalej”). */
  function advanceFlashStudyCard() {
    clearFlashAutoAdvanceTimer();
    if (flashIndex < deck.length - 1) {
      flashIndex += 1;
      flashQuizPicked = null;
      flashQuizCache = null;
      render();
    } else if (flashQuizPicked !== null) {
      pushAppHistory();
      screen = "flash-complete";
      flashQuizPicked = null;
      flashQuizCache = null;
      celebrateSuccess();
      render();
    }
  }

  /** Po poprawnej odpowiedzi: auto „Dalej” po 1 s, jeśli użytkownik nie zmienił karty. */
  function scheduleFlashAutoAdvance(indexAtAnswer) {
    clearFlashAutoAdvanceTimer();
    flashAutoAdvanceTimerId = setTimeout(() => {
      flashAutoAdvanceTimerId = null;
      if (screen !== "flash-study") return;
      if (flashIndex !== indexAtAnswer) return;
      advanceFlashStudyCard();
    }, 1000);
  }

  /**
   * Postęp quizu fiszek w `localStorage` (`fiszki_progress`): klucz = `card.front` (nazwa wzoru),
   * wartość `'correct'` | `'wrong'`. Brak klucza = niewyświetlony.
   * @type {Record<string, 'correct' | 'wrong'>}
   */
  let flashProgress = (function loadFlashProgress() {
    try {
      const raw = JSON.parse(localStorage.getItem("fiszki_progress") || "{}");
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
      /** @type {Record<string, 'correct' | 'wrong'>} */
      const out = {};
      for (const k of Object.keys(raw)) {
        if (raw[k] === "correct" || raw[k] === "wrong") out[k] = raw[k];
      }
      return out;
    } catch {
      return {};
    }
  })();

  function persistFlashProgress() {
    try {
      localStorage.setItem("fiszki_progress", JSON.stringify(flashProgress));
    } catch (e) {
      console.warn("fiszki_progress: zapis do localStorage nie powiódł się", e);
    }
  }

  /** @type {string | null} */
  let taskLevelId = null;
  /** @type {string | null} */
  let taskSectionId = null;
  /** Ścieżka w planie programu (id węzłów) — do nawigacji po klasach i działach. */
  /** @type {string[]} */
  let taskCurriculumPath = [];
  /** `""` = wszystkie działy; inaczej `id` węzła klasy z pierwszego poziomu `level.curriculum` (np. Klasa I). */
  let taskClassTabId = "";
  /** Rozwinięte węzły programu (rozdziały) na liście `task-chapters` — `id` z `curriculum`. */
  let taskCurriculumExpandedIds = new Set();
  let taskIndex = 0;
  let taskAnswerVisible = false;
  let taskFormulasVisible = false;
  let taskSolutionVisible = false;

  let lastTaskQuizGateKey = "";
  let taskQuizPickIndex = null;
  let taskQuizSolved = false;
  /** Liczba błędnych prób w bramce zadania (2-Strike Rule). */
  let taskAttempts = 0;
  /** Szkic wpisanego wyniku (typ math) między renderami. */
  let taskMathInputDraft = "";
  /** Po 2. błędzie — pokazuj poprawny wynik w polu math. */
  let taskMathRevealed = false;
  /** Jednorazowa animacja po poprawnej odpowiedzi w bramce zadania. */
  let taskQuizUnlockAnim = false;

  function appHistoryState() {
    return {
      screen,
      mainTab,
      homeLevelId,
      taskLevelId,
      taskSectionId,
      taskCurriculumPath: Array.isArray(taskCurriculumPath) ? taskCurriculumPath.slice() : [],
      taskIndex,
    };
  }

  function pushAppHistory() {
    history.pushState(appHistoryState(), "", "");
  }

  /** @param {ReturnType<typeof appHistoryState>} state */
  function restoreAppHistory(state) {
    screen = state.screen ?? "main";
    mainTab = state.mainTab ?? "fiszki";
    homeLevelId = state.homeLevelId ?? homeLevelId;
    taskLevelId = state.taskLevelId ?? null;
    taskSectionId = state.taskSectionId ?? null;
    taskCurriculumPath = Array.isArray(state.taskCurriculumPath) ? state.taskCurriculumPath.slice() : [];
    taskIndex = typeof state.taskIndex === "number" ? state.taskIndex : 0;
    loadFizkiConfig();
  }

  function goToMainFromTasks(tab) {
    mainTab = tab;
    taskLevelId = null;
    taskSectionId = null;
    taskCurriculumPath = [];
    lastTaskQuizGateKey = "";
    taskCurriculumExpandedIds.clear();
    applyFizkiConfig();
    screen = "main";
    render();
    history.replaceState(appHistoryState(), "", "");
  }

  function getLevel(id) {
    return TASK_LEVELS.find((l) => l.id === id) || null;
  }

  function hasNodeChildren(node) {
    return !!(node && Array.isArray(node.children) && node.children.length > 0);
  }

  /**
   * @param {TopicSection[] | undefined} nodes
   * @param {string} id
   */
  function findCurriculumNodeById(nodes, id) {
    if (!nodes) return null;
    for (const n of nodes) {
      if (n.id === id) return n;
      if (n.children) {
        const f = findCurriculumNodeById(n.children, id);
        if (f) return f;
      }
    }
    return null;
  }

  /** @param {TopicSection} node */
  function getLeafSectionRefs(node) {
    if (!node) return [];
    if (Array.isArray(node.sectionRefs) && node.sectionRefs.length) return node.sectionRefs.slice();
    if (node.sectionRef) return [node.sectionRef];
    return [];
  }

  /**
   * Id sekcji z `level.sections` powiązane z liśćmi programu w poddrzewie węzła (np. jedna klasa).
   * @param {SchoolLevel} level
   * @param {TopicSection} rootNode
   * @returns {Set<string>}
   */
  function collectSectionIdsUnderCurriculumSubtree(level, rootNode) {
    const ids = new Set();
    /** @param {TopicSection} node */
    function walk(node) {
      if (!node) return;
      if (!hasNodeChildren(node)) {
        for (const rid of getLeafSectionRefs(node)) {
          if (rid && level.sections.some((s) => s.id === rid)) ids.add(String(rid));
        }
        return;
      }
      for (const c of node.children || []) walk(c);
    }
    walk(rootNode);
    return ids;
  }

  /**
   * Rząd zakładek „Klasa …” nad listą działów. Pusty, gdy brak sensownego `curriculum`.
   * @param {SchoolLevel} level
   * @param {string} selectedClassId
   */
  function taskClassTabsHtml(level, selectedClassId) {
    const roots = level.curriculum && Array.isArray(level.curriculum) ? level.curriculum : [];
    const visibleRoots = roots.filter((n) => !(String(n.id).endsWith("-import") && !hasNodeChildren(n)));
    if (!visibleRoots.length) return "";
    const parts = [
      `<button type="button" class="tab" role="tab" data-task-class="" aria-selected="${selectedClassId === "" ? "true" : "false"}">Wszystkie</button>`,
    ];
    for (const n of visibleRoots) {
      const id = String(n.id || "");
      const sel = id === selectedClassId ? "true" : "false";
      const label = n.title != null && String(n.title).trim() ? String(n.title) : id;
      parts.push(
        `<button type="button" class="tab" role="tab" data-task-class="${escapeHtml(id)}" aria-selected="${sel}">${escapeHtml(label)}</button>`
      );
    }
    const classCache = sliderPositionsCache.class || { left: 0, width: 0 };
    return `<div class="tabs tabs-task-class" role="tablist" aria-label="Klasa" data-slider-group="class" style="--slider-left:${classCache.left}px;--slider-width:${classCache.width}px">
          <div class="tab-slider" aria-hidden="true"></div>
          ${parts.join("")}
        </div>`;
  }

  /**
   * Działy do listy w `task-chapters` — wg wybranej klasy lub wszystkie z JSON (w tym z 0 zadań).
   * @param {SchoolLevel} level
   * @param {string} classId
   * @returns {TopicSection[]}
   */
  function sectionsForTaskClassFilter(level, classId) {
    const cid =
      classId !== undefined && classId !== null ? String(classId) : getEffectiveClassFilterId();
    const all = level.sections || [];
    if (!cid || !level.curriculum || !all.length) return all.slice();
    const node = findCurriculumNodeById(level.curriculum, cid);
    if (!node || !hasNodeChildren(node)) return all.slice();
    const allowed = collectSectionIdsUnderCurriculumSubtree(level, node);
    if (!allowed.size) return all.slice();
    return all.filter((s) => allowed.has(s.id));
  }

  /** Waliduje `userGrade` względem planu poziomu. */
  function normalizeUserGradeForLevel(level) {
    if (userGrade === "all") return;
    if (!level || !level.curriculum || !Array.isArray(level.curriculum) || !level.curriculum.length) {
      userGrade = "all";
      return;
    }
    const node = findCurriculumNodeById(level.curriculum, userGrade);
    if (!node || !hasNodeChildren(node)) userGrade = "all";
  }

  /** @deprecated Użyj `normalizeUserGradeForLevel`; utrzymane dla wywołań w renderze zadań. */
  function normalizeTaskClassTabId(level) {
    normalizeUserGradeForLevel(level);
    taskClassTabId = getEffectiveClassFilterId();
  }

  /** Pierwszy poziom planu jak w `taskClassTabsHtml` (bez pustego „import”). */
  function curriculumVisibleClassRoots(level) {
    const roots = level.curriculum && Array.isArray(level.curriculum) ? level.curriculum : [];
    return roots.filter((n) => !(String(n.id || "").endsWith("-import") && !hasNodeChildren(n)));
  }

  /** Liczba zadań dla liścia programu (`sectionRefs` / `sectionRef`). */
  function countTasksOnCurriculumLeaf(level, leafId) {
    const v = getTaskSectionView(level, leafId);
    return v && Array.isArray(v.tasks) ? v.tasks.length : 0;
  }

  /** Suma zadań w poddrzewie (dla nagłówka rozdziału). */
  function countTasksUnderCurriculumNode(level, node) {
    if (!node) return 0;
    if (!hasNodeChildren(node)) return countTasksOnCurriculumLeaf(level, node.id);
    return (node.children || []).reduce((acc, c) => acc + countTasksUnderCurriculumNode(level, c), 0);
  }

  /**
   * Rozwijalny rozdział albo klikalny podrozdział (liść).
   * @param {SchoolLevel} level
   * @param {TopicSection} node
   * @param {number} depth — 0 = pod bezpośrednim „Klasa …”; większe = zagnieżdżenie w planie.
   */
  function renderCurriculumSubtree(level, node, depth) {
    if (!node) return "";
    const title = node.title != null && String(node.title).trim() ? String(node.title) : String(node.id || "");
    if (!hasNodeChildren(node)) {
      const n = countTasksOnCurriculumLeaf(level, node.id);
      if (depth === 0) {
        return `<button type="button" class="list-item" data-curriculum-leaf-id="${escapeHtml(node.id)}">
          ${escapeHtml(title)}
          <small>${escapeHtml(tasksLabel(n))}</small>
        </button>`;
      }
      const nestCls = " task-podrozdzial-card--nested";
      return `<button type="button" class="task-podrozdzial-card${nestCls}" data-curriculum-leaf-id="${escapeHtml(node.id)}">
        <span class="task-podrozdzial-title">${escapeHtml(title)}</span>
        <small class="task-podrozdzial-meta">${escapeHtml(tasksLabel(n))}</small>
      </button>`;
    }
    const expanded = taskCurriculumExpandedIds.has(node.id);
    const chevron = expanded ? "▼" : "▶";
    const total = countTasksUnderCurriculumNode(level, node);
    const sub = (node.children || []).map((ch) => renderCurriculumSubtree(level, ch, depth + 1)).join("");
    const nestedCls = depth > 0 ? " task-rozdzial--nested" : "";
    return `<div class="task-rozdzial${expanded ? " task-rozdzial--open" : ""}${nestedCls}">
      <button type="button" class="task-rozdzial-head" data-rozdzial-id="${escapeHtml(node.id)}" aria-expanded="${
        expanded ? "true" : "false"
      }">
        <span class="task-rozdzial-chev" aria-hidden="true">${chevron}</span>
        <span class="task-rozdzial-title-wrap">
          <span class="task-rozdzial-title">${escapeHtml(title)}</span>
          <small class="task-rozdzial-meta">${escapeHtml(tasksLabel(total))}</small>
        </span>
      </button>
      <div class="task-podrozdzial-stack"${expanded ? "" : " hidden"}>${sub}</div>
    </div>`;
  }

  /**
   * HTML drzewa działów z planu (`curriculum`) dla ekranu listy zadań.
   * @param {SchoolLevel} level
   * @param {string} classId — `""` = wszystkie klasy z planu.
   * @returns {string} pusty, gdy brak planu lub nic do pokazania.
   */
  function renderTaskCurriculumTreeHtml(level, classId) {
    const roots = curriculumVisibleClassRoots(level);
    if (!roots.length) return "";
    const scopes = classId ? roots.filter((r) => r.id === classId) : roots;
    if (!scopes.length) return "";
    const parts = [];
    const showClassTitle = !classId && roots.length > 1;
    for (const classNode of scopes) {
      if (showClassTitle) {
        const t =
          classNode.title != null && String(classNode.title).trim() ? String(classNode.title) : String(classNode.id || "");
        parts.push(`<h3 class="task-class-heading">${escapeHtml(t)}</h3>`);
      }
      if (!hasNodeChildren(classNode)) continue;
      for (const child of classNode.children || []) {
        parts.push(renderCurriculumSubtree(level, child, 0));
      }
    }
    return parts.length ? parts.join("") : "";
  }

  /**
   * @param {SchoolLevel | null} level
   * @param {string} sectionOrLeafId
   */
  function getTaskSectionView(level, sectionOrLeafId) {
    if (!level || !sectionOrLeafId) return null;
    if (level.curriculum) {
      const node = findCurriculumNodeById(level.curriculum, sectionOrLeafId);
      if (node && !hasNodeChildren(node)) {
        const refs = getLeafSectionRefs(node);
        const tasks = refs.flatMap((rid) => {
          const s = level.sections.find((x) => x.id === rid);
          return s && Array.isArray(s.tasks) ? s.tasks : [];
        });
        return { id: node.id, title: node.title, tasks, _fromCurriculum: true };
      }
    }
    return level.sections.find((s) => s.id === sectionOrLeafId) || null;
  }

  function getSection(levelId, sectionId) {
    const level = levelId ? getLevel(levelId) : null;
    if (!level || !sectionId) return null;
    return getTaskSectionView(level, sectionId);
  }

  /**
   * Kolejność zadań: liście programu (podrozdziały) w kolejności drzewa, potem płaska lista działów.
   * @param {SchoolLevel} level
   * @param {string} classId
   * @returns {{ sectionId: string, taskIndex: number }[]}
   */
  function buildTaskNavSequence(level, classId) {
    /** @type {{ sectionId: string, taskIndex: number }[]} */
    const slots = [];

    /** @param {TopicSection[]} nodes */
    function walkCurriculum(nodes) {
      for (const node of nodes || []) {
        if (hasNodeChildren(node)) {
          walkCurriculum(node.children);
          continue;
        }
        const id = String(node.id || "");
        if (!id || id.endsWith("-import") || id.startsWith("imp-")) continue;
        const view = getTaskSectionView(level, id);
        const tasks = view && Array.isArray(view.tasks) ? view.tasks : [];
        for (let i = 0; i < tasks.length; i++) slots.push({ sectionId: id, taskIndex: i });
      }
    }

    const roots = curriculumVisibleClassRoots(level);
    const scopes = classId ? roots.filter((r) => r.id === classId) : roots;
    if (scopes.length && level.curriculum) {
      for (const classNode of scopes) {
        if (hasNodeChildren(classNode)) walkCurriculum(classNode.children);
      }
      if (slots.length) return slots;
    }

    for (const s of sectionsForTaskClassFilter(level, classId)) {
      const tasks = Array.isArray(s.tasks) ? s.tasks : [];
      for (let i = 0; i < tasks.length; i++) slots.push({ sectionId: s.id, taskIndex: i });
    }
    return slots;
  }

  /**
   * @param {SchoolLevel | null | undefined} level
   * @param {string} classId
   * @param {string} sectionId
   * @param {number} index
   * @returns {number}
   */
  function findTaskNavIndex(level, classId, sectionId, index) {
    if (!level || !sectionId) return -1;
    const seq = buildTaskNavSequence(level, classId);
    return seq.findIndex((s) => s.sectionId === sectionId && s.taskIndex === index);
  }

  /**
   * @param {number} delta — -1 poprzednie, +1 następne (przechodzi do sąsiedniego działu / podrozdziału)
   * @returns {boolean}
   */
  function navigateTaskBy(delta) {
    const level = taskLevelId ? getLevel(taskLevelId) : null;
    if (!level || !taskSectionId) return false;
    const classFilter = getEffectiveClassFilterId();
    const seq = buildTaskNavSequence(level, classFilter);
    const idx = findTaskNavIndex(level, classFilter, taskSectionId, taskIndex);
    if (idx < 0) return false;
    const nextIdx = idx + delta;
    if (nextIdx < 0 || nextIdx >= seq.length) return false;
    const target = seq[nextIdx];
    if (target.sectionId !== taskSectionId) pushAppHistory();
    taskSectionId = target.sectionId;
    taskIndex = target.taskIndex;
    taskAnswerVisible = false;
    taskFormulasVisible = false;
    taskSolutionVisible = false;
    render();
    return true;
  }

  /** @param {number} n */
  function tasksLabel(n) {
    if (n === 1) return "1 zadanie";
    const m10 = n % 10;
    const m100 = n % 100;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return n + " zadania";
    return n + " zadań";
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /**
   * @param {{ topic: string, front: string, back: string, symbols?: { tex: string, meaning: string }[] }} card
   * @returns {[string, string][]}
   */
  function getCardSymbolLegendEntries(card) {
    if (Array.isArray(card.symbols) && card.symbols.length > 0) {
      return card.symbols.map((x) => [x.tex, x.meaning]);
    }
    const map = typeof window !== "undefined" && window.__WZORY_SYMBOL_LEGEND__;
    if (map) {
      const row = map[sheetSymbolLegendKey(card.topic, card.front)];
      if (Array.isArray(row) && row.length > 0) return row.slice();
    }
    return [];
  }

  function getAllSymbolLegendPairsFlat() {
    const map = typeof window !== "undefined" && window.__WZORY_SYMBOL_LEGEND__;
    const out = [];
    if (map && typeof map === "object") {
      for (const rows of Object.values(map)) {
        if (!Array.isArray(rows)) continue;
        for (const pair of rows) {
          if (Array.isArray(pair) && pair.length >= 2 && pair[0]) {
            out.push([String(pair[0]).trim(), String(pair[1]).trim()]);
          }
        }
      }
    }
    return out;
  }

  /**
   * Łańcuch LaTeX / tekstu z formulaQuiz do dopasowania symboli z legendy.
   * @param {{ formulaQuiz?: { lhsLatex?: string, prompt?: string, choices?: { katex?: string }[] } }} t
   */
  function taskFormulaQuizLegendHaystack(t) {
    const fq = t && t.formulaQuiz;
    if (!fq) return "";
    const bits = [];
    if (fq.lhsLatex) bits.push(fq.lhsLatex);
    if (fq.prompt) bits.push(fq.prompt);
    if (Array.isArray(fq.choices)) {
      for (const ch of fq.choices) {
        if (ch && ch.katex) bits.push(ch.katex);
      }
    }
    const norm = (s) => String(s).replace(/\s+/g, " ").trim();
    return norm(bits.map((b) => physicsPlainToLatex(String(b || ""))).join(" "));
  }

  /**
   * Wpisy legendy, których fragment `tex` występuje w podanym łańcuchu (np. treść formulaQuiz).
   * Dłuższe symbole sprawdzane pierwsze, żeby preferować np. `\Delta \vec{r}` przed `\Delta`.
   * @param {string} haystack
   * @returns {[string, string][]}
   */
  function getLegendEntriesMatchingHaystack(haystack) {
    const h = String(haystack || "")
      .replace(/\s+/g, " ")
      .trim();
    if (!h) return [];
    const pairs = getAllSymbolLegendPairsFlat().slice();
    pairs.sort((a, b) => b[0].length - a[0].length);
    const out = [];
    const seen = new Set();
    for (const [texRaw, desc] of pairs) {
      const texKey = String(texRaw || "")
        .replace(/\s+/g, " ")
        .trim();
      if (!texKey || seen.has(texKey)) continue;
      if (h.indexOf(texKey) === -1) continue;
      seen.add(texKey);
      out.push([texRaw, desc]);
    }
    return out;
  }

  /**
   * @param {[string, string][]} entries
   */
  function symbolLegendBlockHtml(entries) {
    if (!entries || entries.length === 0) return "";
    const rows = entries
      .map(
        ([tex, desc]) =>
          `<div class="symbol-legend-row"><span class="symbol-legend-tex">${katexHostHtml(tex, false)}</span><span class="symbol-legend-sep" aria-hidden="true"> – </span><span class="symbol-legend-desc">${escapeHtml(
            desc
          )}</span></div>`
      )
      .join("");
    return `<div class="symbol-legend">${rows}</div>`;
  }

  /**
   * @param {{ topic: string, front: string, back: string }[]} cards
   */
  function groupCardsByTopicInOrder(cards) {
    const order = [];
    const map = {};
    for (const c of cards) {
      if (!map[c.topic]) {
        map[c.topic] = [];
        order.push(c.topic);
      }
      map[c.topic].push(c);
    }
    return order.map((topic) => ({ topic, cards: map[topic] }));
  }

  /** @param {{ front: string }[]} cards */
  function countFlashStatsForCards(cards) {
    let correct = 0;
    let wrong = 0;
    let unseen = 0;
    for (const c of cards) {
      const st = flashProgress[c.front];
      if (st === "correct") correct += 1;
      else if (st === "wrong") wrong += 1;
      else unseen += 1;
    }
    return { correct, wrong, unseen };
  }

  /** Pasek: kolory z CSS (`--status-*`); proporcje w `--bar-p1` / `--bar-p2`. */
  function flashTopicTriGradientStyle(correct, wrong, unseen) {
    const t = correct + wrong + unseen;
    if (!t) return "";
    const p1 = ((correct / t) * 100).toFixed(2);
    const p2 = (((correct + wrong) / t) * 100).toFixed(2);
    return `--bar-p1:${p1}%;--bar-p2:${p2}%;`;
  }

  /**
   * Zakładka Fiszki na `main`: tryby globalne + lista działów z postępem.
   * @param {string} levelId
   * @param {string} levelTitle
   */
  function renderFiszkiPanelInnerHtml(levelId, levelTitle) {
    const cards = cardsForHomeLevel(levelId);
    const groups = groupCardsByTopicInOrder(cards);
    const wrongPool = cards.filter((c) => flashProgress[c.front] === "wrong");
    const reviewDisabled = wrongPool.length === 0;
    const reviewDis = reviewDisabled ? " disabled" : "";
    const quickDisabled = cards.length === 0;
    const quickDis = quickDisabled ? " disabled" : "";
    const topicsHtml =
      groups.length === 0
        ? `<p class="hint" style="margin:0">Brak fiszek wzorów dla tego poziomu.</p>`
        : `<div class="flash-topic-grid" role="list">${groups
            .map((g) => {
              const st = countFlashStatsForCards(g.cards);
              const bar = flashTopicTriGradientStyle(st.correct, st.wrong, st.unseen);
              const aria = `Postęp: ${st.correct} poprawnych, ${st.wrong} błędnych, ${st.unseen} niewyświetlonych, ${g.cards.length} wzorów w dziale`;
              return `<button type="button" class="flash-topic-tile" role="listitem" data-flash-topic="${escapeHtml(
                g.topic
              )}" aria-label="${escapeHtml(g.topic + " — " + aria)}">
              <span class="flash-topic-tile-top">
                <span class="flash-topic-tile-title">${escapeHtml(g.topic)}</span>
                <span class="flash-topic-tile-counts">${st.correct} / ${st.wrong} / ${st.unseen}</span>
              </span>
              <div class="flash-topic-bar" style="${bar}" aria-hidden="true"></div>
              <small class="flash-topic-tile-n">${g.cards.length} wzorów</small>
            </button>`;
            })
            .join("")}</div>`;
    return `
          <p class="panel-title">Quiz — rozpoznaj wzór</p>
          <p class="sub panel-sub" style="margin-top:-0.35rem">Poziom: <strong>${escapeHtml(
            levelTitle
          )}</strong> — postęp zapisuje się lokalnie (<code>localStorage</code>, klucz <code>fiszki_progress</code>). Cztery warianty LaTeXu; po odpowiedzi podświetlenie wariantów oraz pełna fiszka z legendą symboli.</p>
          <div class="flash-mode-row">
            <button type="button" class="btn" data-flash-mode="quick10"${quickDis}>Szybka 10 (Losowe z całości)</button>
            <button type="button" class="btn btn-secondary" data-flash-mode="review-wrong"${reviewDis}>Powtórka (Tylko błędy)</button>
          </div>
          <p class="panel-title flash-topic-heading">Działy</p>
          ${topicsHtml}`;
  }

  /**
   * @param {{ topic: string, front: string, back: string }[]} cards
   */
  function renderSheetTopicCardsHtml(cards) {
    return cards
      .map((c) => {
        const leg = symbolLegendBlockHtml(getCardSymbolLegendEntries(c));
        return `<article class="sheet-card"><h4 class="sheet-card-title">${escapeHtml(c.front)}</h4>${flashQuizFormulaBlockHtml(
          physicsPlainToLatex(c.back),
          { stackClass: "quiz-formula-stack sheet-formula-stack", singleWrapClass: "sheet-formula-body" }
        )}${leg}</article>`;
      })
      .join("");
  }

  function renderKartaWzorowPanelHtml() {
    const groups = groupCardsByTopicInOrder(cardsForHomeLevel(homeLevelId));
    const officialSpPdf =
      homeLevelId === "sp"
        ? `<p class="sheet-official-pdf"><a href="${SP_OFFICIAL_SHEET_PDF_URL}" class="sheet-official-pdf-link" target="_blank" rel="noopener noreferrer">Oficjalna karta wzorów — PDF (SP)</a> <span class="sheet-official-pdf-note">(dokument zewnętrzny)</span></p>`
        : "";
    if (groups.length === 0) {
      return `${officialSpPdf}<p class="hint">Brak fiszek wzorów.</p>`;
    }
    sheetTopicIndex = Math.max(0, Math.min(sheetTopicIndex, groups.length - 1));
    const optionsHtml = groups
      .map(
        (g, i) =>
          `<option value="${i}"${i === sheetTopicIndex ? " selected" : ""}>${escapeHtml(g.topic)} (${g.cards.length})</option>`
      )
      .join("");
    const bodyHtml = renderSheetTopicCardsHtml(groups[sheetTopicIndex].cards);
    return `${officialSpPdf}<div class="sheet-layout">
      <nav class="sheet-topic-nav" aria-label="Dział wzorów">
        <label class="sheet-topic-label" for="sheet-topic-select">Dział</label>
        <select id="sheet-topic-select" class="sheet-topic-select">${optionsHtml}</select>
      </nav>
      <div class="sheet-topic-content" id="sheet-topic-body">${bodyHtml}</div>
    </div>`;
  }

  /**
   * Tekst z fragmentami w LaTeXie w obrębie $...$ (inline).
   * @param {string} s
   */
  function mixedTextToHtml(s) {
    const str = String(s);
    if (!str.includes("$")) return escapeHtml(str);
    const parts = str.split("$");
    let out = "";
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        out += escapeHtml(parts[i]);
      } else {
        const tex = parts[i].trim();
        if (tex) out += katexHostHtml(tex, false);
      }
    }
    return out;
  }

  /**
   * Dzieli tekst na fragmenty „tekst” / „$…$” / „$$…$$” (dla łamania wzorów w osobnych liniach).
   * @param {string} s
   * @returns {Array<['text' | 'math', string]>}
   */
  function splitProseAndMath(s) {
    const out = /** @type {Array<['text' | 'math', string]>} */ ([]);
    let rest = String(s);
    while (rest.length) {
      const i = rest.indexOf("$");
      if (i === -1) {
        out.push(["text", rest]);
        break;
      }
      if (i > 0) out.push(["text", rest.slice(0, i)]);
      if (rest.length > i + 1 && rest[i + 1] === "$") {
        const j = rest.indexOf("$$", i + 2);
        if (j === -1) {
          out.push(["text", rest.slice(i)]);
          break;
        }
        out.push(["math", rest.slice(i, j + 2)]);
        rest = rest.slice(j + 2);
        continue;
      }
      const j = rest.indexOf("$", i + 1);
      if (j === -1) {
        out.push(["text", rest.slice(i)]);
        break;
      }
      out.push(["math", rest.slice(i, j + 1)]);
      rest = rest.slice(j + 1);
    }
    return out;
  }

  /** @param {string} mathOuter fragment typu $...$ lub $$...$$ */
  function isDisplayMathOuter(mathOuter) {
    const t = mathOuter.trim();
    if (t.startsWith("$$") && t.endsWith("$$") && t.length >= 6) return true;
    if (!(t.startsWith("$") && t.endsWith("$"))) return false;
    const inner = t.slice(1, -1).trim();
    if (inner.length >= 14) return true;
    if (/\\dfrac|\\frac|\\sqrt|\\sum|\\int/.test(inner)) return true;
    if ((inner.match(/=/g) || []).length >= 1 && inner.length >= 12) return true;
    return false;
  }

  /**
   * Wstawia puste linie wokół „dużych” wzorów $…$, żeby nie były w jednym ciągu z tłumaczeniem.
   * Jeśli tekst już zawiera podwójne znaki nowej linii, zostaje bez zmian.
   * @param {string} s
   */
  function reflowProseMath(s) {
    const raw = String(s);
    if (/\n\s*\n/.test(raw)) return raw;
    const segs = splitProseAndMath(raw);
    if (segs.length <= 1) return raw;
    let out = "";
    for (let k = 0; k < segs.length; k++) {
      const typ = segs[k][0];
      const val = segs[k][1];
      if (typ === "text") {
        out += val;
      } else if (isDisplayMathOuter(val)) {
        out = out.replace(/\s+$/, "");
        out += "\n\n" + val.trim() + "\n\n";
      } else {
        out += val;
      }
    }
    return out.replace(/\n{3,}/g, "\n\n").trim();
  }

  /** Cała linia to dokładnie jeden fragment $…$ (do wyświetlenia w trybie wyświetlacza). */
  function isWrappingSingleMathLine(t) {
    const x = t.trim();
    if (x.length < 4 || x[0] !== "$" || x.startsWith("$$")) return false;
    const j = x.indexOf("$", 1);
    return j === x.length - 1;
  }

  /**
   * Tekst z $…$ oraz łamaniami linii: akapity, wzory w osobnych wierszach (KaTeX display dla linii będących samym wzorem).
   * @param {string} s
   */
  function richMixedLinesToHtml(s) {
    const reflowed = reflowProseMath(s);
    const lines = reflowed.split(/\n/);
    const htmlParts = [];
    for (const rawLine of lines) {
      if (rawLine.trim() === "") {
        htmlParts.push('<div class="rich-line-spacer" aria-hidden="true"></div>');
        continue;
      }
      const trimmed = rawLine.trim();
      if (trimmed.startsWith("$$") && trimmed.endsWith("$$") && trimmed.length >= 6) {
        const inner = trimmed.slice(2, -2).trim();
        htmlParts.push('<div class="rich-formula-block">' + katexHostHtml(inner, true) + "</div>");
      } else if (isWrappingSingleMathLine(trimmed)) {
        const inner = trimmed.slice(1, -1).trim();
        htmlParts.push('<div class="rich-formula-block">' + katexHostHtml(inner, true) + "</div>");
      } else {
        htmlParts.push('<p class="rich-text-line">' + mixedTextToHtml(trimmed) + "</p>");
      }
    }
    return htmlParts.join("");
  }

  /**
   * @param {string[]} items
   */
  function taskFormulaListHtml(items) {
    if (!items.length) return "";
    return (
      `<ul class="formula-list">` +
      items.map((f) => `<li>${katexHostHtml(formulaLineToLatex(f), false)}</li>`).join("") +
      `</ul>`
    );
  }

  /**
   * @param {Task} t
   */
  function getSolutionSteps(t) {
    if (Array.isArray(t.solutionSteps) && t.solutionSteps.length > 0) {
      return t.solutionSteps;
    }
    return [
      "Krok 1 — Dane i szukane\n\nWypisz z treści liczby z jednostkami i jednostki SI. Sprawdź zgodność jednostek (np. km/h → m/s).",
      "Krok 2 — Model fizyczny\n\nNazwij zjawisko (np. ruch jednostajny, II zasada dynamiki).\n\nWzory masz w sekcji «Wzory» powyżej — przepisz je w notatkach, każdy w osobnej linii.",
      "Krok 3 — Obliczenia\n\nPodstaw wartości, licz ułamki i pierwiastki krok po kroku; sprawdź znak i sens fizyczny.",
      "Krok 4 — Wynik\n\nPorównaj z «Pokaż odpowiedź» i zweryfikuj jednostkę oraz rząd wielkości.",
    ];
  }

  /** Odświeżenie listy wzorów po zmianie wyboru w #sheet-topic-select (Karta wzorów). */
  let sheetTopicSelectApplyRaf = null;
  function applySheetTopicSelectChange() {
    if (sheetTopicSelectApplyRaf != null) cancelAnimationFrame(sheetTopicSelectApplyRaf);
    sheetTopicSelectApplyRaf = requestAnimationFrame(() => {
      sheetTopicSelectApplyRaf = null;
      const sheetTopicSel = document.getElementById("sheet-topic-select");
      const sheetTopicBody = document.getElementById("sheet-topic-body");
      if (!sheetTopicSel || !sheetTopicBody) return;
      const groups = groupCardsByTopicInOrder(cardsForHomeLevel(homeLevelId));
      if (!groups.length) {
        sheetTopicBody.innerHTML = '<p class="hint" style="margin:0">Brak wzorów dla tego poziomu.</p>';
        queueMountKatex();
        return;
      }
      let idx = parseInt(sheetTopicSel.value, 10);
      if (Number.isNaN(idx)) idx = 0;
      idx = Math.max(0, Math.min(idx, groups.length - 1));
      sheetTopicIndex = idx;
      sheetTopicBody.innerHTML = renderSheetTopicCardsHtml(groups[idx].cards);
      queueMountKatex();
    });
  }

  /**
   * Synchronizacja paneli głównych po `innerHTML` (bez podpisywania kliknięć — delegacja na `#app`).
   * @param {'fiszki' | 'zadania' | 'karta-wzorow'} tab
   */
  function applyMainTabPanels(tab) {
    const tabFiszki = document.getElementById("tab-fiszki");
    const tabKartaWzorow = document.getElementById("tab-karta-wzorow");
    const tabZadania = document.getElementById("tab-zadania");
    const panelFiszki = document.getElementById("panel-fiszki");
    const panelKartaWzorow = document.getElementById("panel-karta-wzorow");
    const panelZadania = document.getElementById("panel-zadania");
    if (!tabFiszki || !tabKartaWzorow || !tabZadania || !panelFiszki || !panelKartaWzorow || !panelZadania) return;
    tabFiszki.setAttribute("aria-selected", tab === "fiszki" ? "true" : "false");
    tabKartaWzorow.setAttribute("aria-selected", tab === "karta-wzorow" ? "true" : "false");
    tabZadania.setAttribute("aria-selected", tab === "zadania" ? "true" : "false");
    panelFiszki.hidden = tab !== "fiszki";
    panelKartaWzorow.hidden = tab !== "karta-wzorow";
    panelZadania.hidden = tab !== "zadania";
    requestAnimationFrame(updateTabSliders);
  }

  /** Jednorazowa delegacja na `#app` — przetrwa zastępowanie `innerHTML` potomków. Poziomy i zakładki treści także na ekranach zadań. */
  function installAppRootDelegation() {
    if (!app || app.dataset.appDelegation === "1") return;
    app.dataset.appDelegation = "1";

    if (document.documentElement.dataset.themeDelegation !== "1") {
      document.documentElement.dataset.themeDelegation = "1";
      document.addEventListener("click", (ev) => {
        const raw = ev.target;
        const el = raw instanceof Element ? raw : raw && raw.parentElement;
        if (!(el instanceof Element)) return;
        if (!el.closest("#theme-toggle")) return;
        const current = document.documentElement.dataset.theme || "dark";
        const next = current === "light" ? "dark" : "light";
        document.documentElement.dataset.theme = next;
        localStorage.setItem("fizki_theme", next);
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute("content", next === "light" ? "#f4f4f9" : "#121212");
      });
    }

    app.addEventListener("click", (ev) => {
      const raw = ev.target;
      const el = raw instanceof Element ? raw : raw && raw.parentElement;
      if (!(el instanceof Element)) return;

      const navScreens = screen === "main" || screen === "task-chapters" || screen === "task-detail";
      if (navScreens) {
        const mainTabBtn = el.closest("[data-main-tab]");
        if (mainTabBtn) {
          const which = String(mainTabBtn.dataset.mainTab || mainTabBtn.getAttribute("data-main-tab") || "").trim();
          if (which === "zadania") {
            applyFizkiConfig();
            pushAppHistory();
            mainTab = "zadania";
            taskLevelId = homeLevelId;
            taskSectionId = null;
            taskIndex = 0;
            taskAnswerVisible = false;
            taskFormulasVisible = false;
            taskSolutionVisible = false;
            taskCurriculumPath = [];
            lastTaskQuizGateKey = "";
            taskCurriculumExpandedIds.clear();
            screen = "task-chapters";
            render();
            return;
          }
          if (which === "fiszki" || which === "karta-wzorow") {
            mainTab = /** @type {'fiszki' | 'karta-wzorow'} */ (which);
            if (screen === "main") {
              applyMainTabPanels(mainTab);
              return;
            }
            goToMainFromTasks(/** @type {'fiszki' | 'karta-wzorow'} */ (which));
            return;
          }
        }
      }

      if (screen === "main" && mainTab === "fiszki") {
        const modeBtn = el.closest("[data-flash-mode]");
        if (modeBtn instanceof HTMLButtonElement && !modeBtn.disabled) {
          const which = String(modeBtn.getAttribute("data-flash-mode") || "").trim();
          const pool = cardsForHomeLevel(homeLevelId);
          if (which === "quick10") {
            const shuffled = fisherYatesShuffle(pool.slice());
            deck = shuffled.slice(0, Math.min(10, shuffled.length));
            flashIndex = 0;
            flashQuizPicked = null;
            flashQuizCache = null;
            clearFlashAutoAdvanceTimer();
            pushAppHistory();
            screen = "flash-study";
            render();
            return;
          }
          if (which === "review-wrong") {
            const wrongOnly = pool.filter((c) => flashProgress[c.front] === "wrong");
            if (!wrongOnly.length) return;
            deck = fisherYatesShuffle(wrongOnly.slice());
            flashIndex = 0;
            flashQuizPicked = null;
            flashQuizCache = null;
            clearFlashAutoAdvanceTimer();
            pushAppHistory();
            screen = "flash-study";
            render();
            return;
          }
        }
        const topicBtn = el.closest("[data-flash-topic]");
        if (topicBtn instanceof HTMLButtonElement) {
          const topic = topicBtn.getAttribute("data-flash-topic");
          if (!topic) return;
          const subset = cardsForHomeLevel(homeLevelId).filter((c) => c.topic === topic);
          if (!subset.length) return;
          deck = fisherYatesShuffle(subset.slice());
          flashIndex = 0;
          flashQuizPicked = null;
          flashQuizCache = null;
          clearFlashAutoAdvanceTimer();
          pushAppHistory();
          screen = "flash-study";
          render();
          return;
        }
      }
    });

    app.addEventListener("change", onSheetTopicSelectMaybe);
    app.addEventListener("input", onSheetTopicSelectMaybe);
  }

  /** @param {Event} ev */
  function onSheetTopicSelectMaybe(ev) {
    const t = ev.target;
    if (!(t instanceof HTMLSelectElement) || t.id !== "sheet-topic-select") return;
    if (screen !== "main" || mainTab !== "karta-wzorow") return;
    applySheetTopicSelectChange();
  }

  /** Zakładki treści (Fiszki / Karta / Zadania) — `main` i widoki zadań. */
  function homeNavTabsHtml() {
    const mainCache = sliderPositionsCache.main || { left: 0, width: 0 };
    return `<div class="tabs tabs-main" role="tablist" aria-label="Treść" data-slider-group="main" style="--slider-left:${mainCache.left}px;--slider-width:${mainCache.width}px">
          <div class="tab-slider" aria-hidden="true"></div>
          <button type="button" class="tab" role="tab" id="tab-fiszki" data-main-tab="fiszki" aria-selected="${mainTab === "fiszki" ? "true" : "false"}">Fiszki</button>
          <button type="button" class="tab" role="tab" id="tab-karta-wzorow" data-main-tab="karta-wzorow" aria-selected="${mainTab === "karta-wzorow" ? "true" : "false"}">Karta wzorów</button>
          <button type="button" class="tab" role="tab" id="tab-zadania" data-main-tab="zadania" aria-selected="${mainTab === "zadania" ? "true" : "false"}">Zadania</button>
        </div>`;
  }

  function render(newScreen) {
    if (newScreen) screen = newScreen;

    const performRender = () => {
      try {
    if (screen === "flash-study" || screen === "flash-complete") {
      lastTaskQuizGateKey = "";
      taskQuizPickIndex = null;
      taskQuizSolved = false;
      taskQuizUnlockAnim = false;
    } else if (screen === "task-chapters" || screen === "task-detail") {
      flashQuizPicked = null;
      flashQuizCache = null;
    }

    if (screen === "onboarding-school") {
      app.innerHTML = renderOnboardingSchoolHtml();
      updateAppBreadcrumb();
      app.querySelectorAll("[data-onboarding-school]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-onboarding-school");
          if (!id) return;
          _pendingOnboardingLevel = id;
          screen = "onboarding-grade";
          render();
        });
      });
      return;
    }

    if (screen === "onboarding-grade") {
      if (!_pendingOnboardingLevel) {
        screen = "onboarding-school";
        render();
        return;
      }
      app.innerHTML = renderOnboardingGradeHtml();
      updateAppBreadcrumb();
      app.querySelectorAll("[data-onboarding-grade]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const gradeId = btn.getAttribute("data-onboarding-grade");
          if (!gradeId) return;
          userLevel = _pendingOnboardingLevel;
          userGrade = gradeId;
          _pendingOnboardingLevel = "";
          saveFizkiConfig();
          sheetTopicIndex = 0;
          deck = cardsForHomeLevel(homeLevelId).slice();
          taskCurriculumExpandedIds.clear();
          screen = "main";
          mainTab = "fiszki";
          render("main");
          history.replaceState(appHistoryState(), "", "");
        });
      });
      return;
    }

    if (screen === "main") {
      applyFizkiConfig();

      const resolvedLevel = getLevel(homeLevelId);
      let hl = resolvedLevel;
      if (!hl) {
        hl = {
          id: homeLevelId,
          title: HOME_LEVEL_FALLBACK_TITLES[homeLevelId] || homeLevelId,
          sections: [],
        };
      }


      app.innerHTML = `
        ${homeNavTabsHtml()}
        <div id="panel-fiszki" role="tabpanel" aria-labelledby="tab-fiszki">
          ${renderFiszkiPanelInnerHtml(homeLevelId, hl.title)}
        </div>
        <div id="panel-karta-wzorow" role="tabpanel" aria-labelledby="tab-karta-wzorow" hidden>
          <p class="panel-title">Karta wzorów (CKE)</p>
          <p class="sub panel-sub">Poziom: <strong>${escapeHtml(hl.title)}</strong> — wybierz dział z menu (tylko wzory dla tego poziomu). Pod wzorem — legenda symboli.</p>
          <div class="sheet-panel-wrap">${renderKartaWzorowPanelHtml()}</div>
        </div>
        <div id="panel-zadania" role="tabpanel" aria-labelledby="tab-zadania" hidden></div>
      `;
      applyMainTabPanels(mainTab);
      queueMountKatex();
      return;
    }

    else if (screen === "flash-complete") {
      app.innerHTML = `
        <div class="flash-complete-scene">
          <p class="flash-complete-title">Ukończono dział!</p>
          <button type="button" class="btn" id="btn-flash-complete-menu">Wróć do Menu</button>
        </div>`;
      const btnDone = document.getElementById("btn-flash-complete-menu");
      if (btnDone) {
        btnDone.onclick = () => {
          history.back();
        };
      }
      return;
    }

    else if (screen === "flash-study") {
      if (deck.length === 0) {
        history.back();
        return;
      }
      if (flashIndex >= deck.length) flashIndex = 0;
      const card = deck[flashIndex];
      if (!flashQuizCache || flashQuizCache.index !== flashIndex) {
        flashQuizCache = { index: flashIndex, ...buildFlashQuizChoices(card) };
        flashQuizPicked = null;
      }
      const quiz = flashQuizCache;
      const showFullCard = flashQuizPicked !== null;
      const correctLatex = physicsPlainToLatex(card.back).trim();
      const quizOptsGridClass = "quiz-options quiz-options--stack";

      const headInnerHtml = showFullCard
        ? `<div class="quiz-flip-face" aria-live="polite">
            <span class="label">Pełna fiszka</span>
            <p class="quiz-flip-topic">${escapeHtml(card.topic)} — ${escapeHtml(card.front)}</p>
            ${flashQuizFormulaBlockHtml(correctLatex, { stackClass: "quiz-formula-stack quiz-flip-formula-split" })}
            ${symbolLegendBlockHtml(getCardSymbolLegendEntries(card))}
          </div>`
        : `<div class="quiz-prompt-question">
            <span class="label">${escapeHtml(card.topic)}</span>
            <p class="quiz-question-title">${escapeHtml(card.front)}</p>
          </div>`;

      const optionsHtml = quiz.choices
        .map((tex, i) => {
          let cls = "quiz-option";
          if (/\\vec\b/.test(String(tex))) cls += " is-vector-distractor";
          if (flashQuizPicked !== null) {
            if (i === quiz.correctIndex) cls += " quiz-option--correct";
            else if (i === flashQuizPicked) cls += " quiz-option--wrong-pick";
          }
          const dis = flashQuizPicked !== null ? " disabled" : "";
          return `<button type="button" class="${cls}" data-quiz-opt="${i}" aria-label="Wariant ${i + 1}"${dis}>
            ${flashQuizFormulaBlockHtml(tex)}
          </button>`;
        })
        .join("");

      app.innerHTML = `
        <div class="flash-study">
          <div class="flash-study-body">
            <div class="top-bar">
              <button type="button" class="btn btn-secondary btn-back" id="btn-main">← Menu</button>
              <h1>Fiszki — quiz</h1>
            </div>
            <p class="progress flash-study-progress">${flashIndex + 1} / ${deck.length}</p>
            <div class="quiz-scene flash-card-container">
              <div class="quiz-card quiz-card--flip">
                <div class="quiz-prompt-slot">${headInnerHtml}</div>
                <div class="${quizOptsGridClass}" role="group" aria-label="Warianty odpowiedzi">
                  ${optionsHtml}
                </div>
              </div>
            </div>
          </div>
          <nav class="flash-nav" aria-label="Nawigacja między fiszkami">
            <div class="flash-nav-row">
              <button type="button" class="btn btn-secondary" id="btn-prev">Wstecz</button>
              <button type="button" class="btn btn-secondary" id="btn-next">Dalej</button>
            </div>
          </nav>
        </div>
      `;

      document.getElementById("btn-main").onclick = () => {
        history.back();
      };

      app.querySelectorAll("[data-quiz-opt]").forEach((btn) => {
        btn.onclick = () => {
          if (flashQuizPicked !== null) return;
          const i = Number(btn.getAttribute("data-quiz-opt"));
          if (Number.isNaN(i)) return;
          const isCorrect = i === quiz.correctIndex;
          flashProgress[card.front] = isCorrect ? "correct" : "wrong";
          persistFlashProgress();
          const indexAtAnswer = flashIndex;
          flashQuizPicked = i;
          render();
          if (isCorrect) scheduleFlashAutoAdvance(indexAtAnswer);
        };
      });

      document.getElementById("btn-prev").onclick = () => {
        clearFlashAutoAdvanceTimer();
        if (flashIndex > 0) {
          flashIndex -= 1;
          flashQuizPicked = null;
          flashQuizCache = null;
          render();
        }
      };

      document.getElementById("btn-next").onclick = () => {
        clearFlashAutoAdvanceTimer();
        advanceFlashStudyCard();
      };
      queueMountKatex();
      return;
    }

    else if (screen === "task-chapters") {
      applyFizkiConfig();
      if (!taskLevelId) taskLevelId = homeLevelId;
      const level = taskLevelId ? getLevel(taskLevelId) : null;
      if (!level) {
        screen = "main";
        render();
        return;
      }

      /** Lista zadań w wybranym dziale (`level.sections`). */
      if (taskSectionId) {
        const sec = getSection(taskLevelId, taskSectionId);
        if (!sec) {
          taskSectionId = null;
          render();
          return;
        }

        const items =
          sec.tasks.length > 0
            ? sec.tasks
                .map(
                  (t, i) => `
        <button type="button" class="list-item" data-task-i="${i}">
          <span class="list-item-title">${escapeHtml(t.title)}</span>
          ${taskDifficultyStarsHtml(t.difficulty)}
        </button>`
                )
                .join("")
            : `<p class="hint" style="margin:0">Brak zadań w tym dziale. Wybierz inny dział lub dopisz zestaw w JSON.</p>`;

        app.innerHTML = `
        ${homeNavTabsHtml()}
        <div class="top-bar">
          <button type="button" class="btn btn-secondary btn-back" id="btn-back-chapters">← Działy</button>
          <h2 class="top-bar-title">Zadania</h2>
        </div>
        <p class="sub" style="margin-bottom:0.35rem">${escapeHtml(level.title)}</p>
        <p class="panel-title" style="margin-top:0.65rem">${escapeHtml(sec.title)}</p>
        <div class="list-stack">${items}</div>
      `;

        document.getElementById("btn-back-chapters").onclick = () => {
          history.back();
        };

        app.querySelectorAll("[data-task-i]").forEach((btn) => {
          btn.onclick = () => {
            pushAppHistory();
            taskIndex = Number(btn.getAttribute("data-task-i"));
            taskAnswerVisible = false;
            taskFormulasVisible = false;
            taskSolutionVisible = false;
            screen = "task-detail";
            render();
          };
        });
        return;
      }

      applyFizkiConfig();
      normalizeTaskClassTabId(level);
      const classFilter = getEffectiveClassFilterId();
      const treeHtml = renderTaskCurriculumTreeHtml(level, classFilter);

      let chaptersHtml;
      if (treeHtml) {
        chaptersHtml = treeHtml;
      } else {
        const filteredSections = sectionsForTaskClassFilter(level);
        chaptersHtml =
          filteredSections.length > 0
            ? filteredSections
                .map((s) => {
                  const n = Array.isArray(s.tasks) ? s.tasks.length : 0;
                  return `
        <button type="button" class="list-item" data-section-id="${escapeHtml(s.id)}">
          ${escapeHtml(s.title)}
          <small>${tasksLabel(n)}</small>
        </button>`;
                })
                .join("")
            : `<p class="hint" style="margin:0">${
                userGrade !== "all"
                  ? "Brak działów przypisanych do wybranej klasy — zmień klasę w ustawieniach u góry."
                  : "Brak zdefiniowanych działów dla tego poziomu. Uzupełnij zadania.json."
              }</p>`;
      }

      app.innerHTML = `
        ${homeNavTabsHtml()}
        <p class="panel-title task-dzialy-heading">Działy</p>
        <div class="list-stack task-curriculum-root">${chaptersHtml}</div>
      `;

      app.querySelectorAll("[data-section-id]").forEach((btn) => {
        btn.onclick = () => {
          const id = btn.getAttribute("data-section-id");
          if (!id) return;
          pushAppHistory();
          taskSectionId = id;
          taskIndex = 0;
          taskAnswerVisible = false;
          taskFormulasVisible = false;
          taskSolutionVisible = false;
          taskCurriculumPath = [];
          render();
        };
      });

      app.querySelectorAll("[data-curriculum-leaf-id]").forEach((btn) => {
        btn.onclick = () => {
          const id = btn.getAttribute("data-curriculum-leaf-id");
          if (!id) return;
          pushAppHistory();
          taskSectionId = id;
          taskIndex = 0;
          taskAnswerVisible = false;
          taskFormulasVisible = false;
          taskSolutionVisible = false;
          taskCurriculumPath = [];
          render();
        };
      });

      app.querySelectorAll("[data-rozdzial-id]").forEach((btn) => {
        btn.onclick = () => {
          const id = btn.getAttribute("data-rozdzial-id");
          if (!id) return;
          if (taskCurriculumExpandedIds.has(id)) taskCurriculumExpandedIds.delete(id);
          else taskCurriculumExpandedIds.add(id);
          render();
        };
      });

      return;
    }

    else if (screen === "task-detail") {
      const sec = taskLevelId && taskSectionId ? getSection(taskLevelId, taskSectionId) : null;
      if (!sec || !Array.isArray(sec.tasks) || sec.tasks.length === 0) {
        screen = "task-chapters";
        taskSectionId = null;
        taskAnswerVisible = false;
        taskFormulasVisible = false;
        taskSolutionVisible = false;
        render();
        return;
      }
      if (!sec.tasks[taskIndex]) {
        screen = "task-chapters";
        taskSectionId = null;
        render();
        return;
      }
      const level = getLevel(taskLevelId);
      const t = sec.tasks[taskIndex];

      const quizGateKey = taskLevelId + "\x1e" + taskSectionId + "\x1e" + taskIndex;
      if (quizGateKey !== lastTaskQuizGateKey) {
        lastTaskQuizGateKey = quizGateKey;
        taskQuizPickIndex = null;
        taskAttempts = 0;
        taskMathInputDraft = "";
        taskMathRevealed = false;
        taskQuizSolved = !taskNeedsAnswerGate(t);
        taskAnswerVisible = false;
        taskFormulasVisible = false;
        taskSolutionVisible = false;
      }

      const taskType = getTaskType(t);
      const needsAnswerGate = taskNeedsAnswerGate(t);
      const needsLegacyQuizGate = taskType === "open" && taskNeedsQuizGate(t);
      const gateLocked = needsAnswerGate && !taskQuizSolved;
      const fq = t.formulaQuiz;

      let taskAnswerGateHtml = "";
      if (taskType === "math" && needsAnswerGate) {
        const mathInputVal = taskMathRevealed ? String(t.mathValue ?? "") : taskMathInputDraft;
        const mathInputCls = "task-math-input" + (taskMathRevealed ? " task-math-input--revealed" : "");
        const strikeHint =
          taskAttempts === 1 && !taskQuizSolved
            ? `<p class="task-strike-hint" role="status">Gdzieś jest błąd. Sprawdź jednostki lub przekształcenia i spróbuj jeszcze raz.</p>`
            : "";
        const unitSuffix = t.mathUnit ? `<span class="task-math-unit">${escapeHtml(t.mathUnit)}</span>` : "";
        taskAnswerGateHtml = `
          <div class="task-answer-gate task-answer-gate--math" id="task-answer-gate">
            <p class="answer-label">Twój wynik</p>
            <div class="task-math-row">
              <input type="text" class="${mathInputCls}" id="task-math-input" inputmode="decimal" autocomplete="off" placeholder="Wpisz wynik" value="${escapeHtml(
                mathInputVal
              )}"${taskQuizSolved ? " disabled" : ""} />
              ${unitSuffix}
              <button type="button" class="btn" id="btn-check-math"${taskQuizSolved ? " disabled" : ""}>Sprawdź</button>
            </div>
            ${strikeHint}
          </div>`;
      } else if (taskType === "abcd" && needsAnswerGate) {
        const abcdOpts = (t.abcdOptions || []).slice(0, 4);
        const abcdCells = abcdOpts
          .map((opt, i) => {
            let cls = "btn task-abcd-option";
            if (taskQuizPickIndex === i) {
              cls += opt.isCorrect ? " task-abcd-option--correct" : " task-abcd-option--wrong";
            } else if (taskAttempts >= 2 && opt.isCorrect) {
              cls += " task-abcd-option--correct";
            }
            const dis = taskQuizSolved || taskAttempts >= 2 ? " disabled" : "";
            return `<button type="button" class="${cls}" data-task-abcd-opt="${i}"${dis}>${richMixedLinesToHtml(
              String(opt.text || "")
            )}</button>`;
          })
          .join("");
        const strikeHint =
          taskAttempts === 1 && !taskQuizSolved
            ? `<p class="task-strike-hint" role="status">Gdzieś jest błąd. Sprawdź jednostki lub przekształcenia i spróbuj jeszcze raz.</p>`
            : "";
        taskAnswerGateHtml = `
          <div class="task-answer-gate task-answer-gate--abcd" id="task-answer-gate">
            <p class="answer-label">Wybierz odpowiedź</p>
            <div class="task-abcd-options" role="group">${abcdCells}</div>
            ${strikeHint}
          </div>`;
      }

      let formulaQuizHtml = "";
      if (needsLegacyQuizGate && fq) {
        const quizOptsClass = "quiz-options quiz-options--stack task-quiz-options";
        const opts = fq.choices
          .map((ch, i) => {
            let cls = "quiz-option task-quiz-option";
            if (/\\vec\b/.test(String(ch.katex))) cls += " is-vector-distractor";
            if (taskQuizPickIndex === i) {
              if (ch.correct) cls += " quiz-option--correct";
              else cls += " quiz-option--wrong-pick";
            }
            const dis = taskQuizSolved ? " disabled" : "";
            const rationaleUnder =
              taskQuizPickIndex === i && !ch.correct && ch.distractorRationale
                ? `<div class="task-quiz-option-rationale" role="status"><span class="task-quiz-option-rationale-label">Wskazówka:</span><div class="task-quiz-option-rationale-body">${richMixedLinesToHtml(
                    String(ch.distractorRationale)
                  )}</div></div>`
                : "";
            return `<div class="task-quiz-option-cell">
              <button type="button" class="${cls}" data-task-quiz-opt="${i}" aria-label="Wariant ${i + 1}"${dis}><div class="sheet-formula quiz-option-formula">${katexHostHtml(
              String(ch.katex || ""),
              true
            )}</div></button>${rationaleUnder}</div>`;
          })
          .join("");
        formulaQuizHtml = `
          <div class="task-formula-quiz" aria-label="Quiz wzoru">
            <p class="answer-label">Sprawdź wzór</p>
            <div class="task-quiz-prompt">${richMixedLinesToHtml(String(fq.prompt || ""))}</div>
            <div class="${quizOptsClass}" role="group">${opts}</div>
          </div>`;
      }

      const gateAttrLocked = gateLocked ? " disabled" : "";
      const gateClsLocked = gateLocked ? " btn-gated" : "";

      const ansClass = taskAnswerVisible ? "answer-block" : "answer-block hidden";
      const formulas = Array.isArray(t.formulas) ? t.formulas : [];
      const sheetLines = getTaskSheetLines(t);
      const laws = Array.isArray(t.laws) ? t.laws : [];
      const formulasClass = taskFormulasVisible ? "formulas-block" : "formulas-block hidden";

      const lawsHtml =
        laws.length > 0
          ? `<p class="formula-subheading">Prawa i założenia</p><ul class="formula-list law-list">${laws
              .map((line) => `<li><div class="law-line-body">${richMixedLinesToHtml(line)}</div></li>`)
              .join("")}</ul>`
          : "";

      let formulasBody = "";
      if (sheetLines.length > 0) {
        formulasBody += `<p class="formula-subheading">Wzory z karty wzorów (CKE)</p>${taskFormulaListHtml(sheetLines)}`;
      }
      if (formulas.length > 0) {
        const subLabel = sheetLines.length > 0 ? "Wzory dodatkowe (poza kartą)" : "";
        if (subLabel) formulasBody += `<p class="formula-subheading">${subLabel}</p>`;
        formulasBody += taskFormulaListHtml(formulas);
      }
      if (!lawsHtml && !sheetLines.length && !formulas.length) {
        formulasBody = `<p class="hint" style="margin:0">Brak dopisanych wzorów do tego zadania.</p>`;
      } else {
        formulasBody = lawsHtml + formulasBody;
      }

      const steps = getSolutionSteps(t);
      const solClass = taskSolutionVisible ? "solution-block" : "solution-block hidden";
      const solutionListHtml = `<ol class="solution-steps">${steps
        .map((step) => `<li><div class="solution-step-body">${richMixedLinesToHtml(step)}</div></li>`)
        .join("")}</ol>`;

      const quizLegendHaystack =
        taskQuizSolved && needsLegacyQuizGate && fq ? taskFormulaQuizLegendHaystack(t) : "";
      const quizLegendEntries = quizLegendHaystack ? getLegendEntriesMatchingHaystack(quizLegendHaystack) : [];
      const quizLegendHtml =
        taskQuizSolved && needsLegacyQuizGate && fq
          ? quizLegendEntries.length > 0
            ? `<div class="task-quiz-symbol-legend"><p class="answer-label">Legenda symboli (wzór z quizu)</p>${symbolLegendBlockHtml(
                quizLegendEntries
              )}</div>`
            : `<div class="task-quiz-symbol-legend"><p class="hint" style="margin:0">Brak dopasowanych symboli w bazie legendy dla tego wzoru.</p></div>`
          : "";

      const unlockAnimClass = taskQuizUnlockAnim ? " task-quiz-unlock-anim" : "";
      const showSuccessFeedback = taskQuizSolved && taskQuizUnlockAnim;
      taskQuizUnlockAnim = false;

      const classFilter = getEffectiveClassFilterId();
      const navSeq = level ? buildTaskNavSequence(level, classFilter) : [];
      const navIdx = level ? findTaskNavIndex(level, classFilter, taskSectionId, taskIndex) : -1;
      const canTaskPrev = navIdx > 0;
      const canTaskNext = navIdx >= 0 && navIdx < navSeq.length - 1;

      const escapeHatchHtml =
        needsAnswerGate && !taskQuizSolved
          ? `<div class="task-quiz-footer">
              <button type="button" class="btn btn-secondary btn-escape-hatch" id="btn-escape-hatch">Nie wiem, pokaż rozwiązanie</button>
            </div>`
          : "";

      const successFeedbackHtml = showSuccessFeedback
        ? `<p class="task-success-feedback" role="status">🎉 Świetnie! Odblokowano rozwiązanie.</p>`
        : "";

      const taskActionsHtml = `<div class="task-hint-actions">
            ${successFeedbackHtml}
            <button type="button" class="btn-hint${taskFormulasVisible ? " btn-hint--active" : ""}" id="btn-toggle-formulas">
              ${taskFormulasVisible ? "Ukryj wzory" : "Pokaż wzory"}
            </button>
            <button type="button" class="btn-hint${taskAnswerVisible ? " btn-hint--active" : ""}${gateClsLocked}" id="btn-toggle-answer"${gateAttrLocked}>
              ${taskAnswerVisible ? "Ukryj odpowiedź" : "Pokaż odpowiedź"}
            </button>
            <button type="button" class="btn-hint${taskSolutionVisible ? " btn-hint--active" : ""}${gateClsLocked}" id="btn-toggle-solution"${gateAttrLocked}>
              ${taskSolutionVisible ? "Ukryj pełne rozwiązanie" : "Pokaż pełne rozwiązanie (kroki)"}
            </button>
          </div>`;

      app.innerHTML = `
        ${homeNavTabsHtml()}
        <div class="top-bar">
          <button type="button" class="btn btn-secondary btn-back" id="btn-back-list">← Lista</button>
          <h2 class="top-bar-title">Zadanie</h2>
        </div>
        <p class="progress">${taskIndex + 1} / ${sec.tasks.length} · ${escapeHtml(level ? level.title : "")} · ${escapeHtml(sec.title)}</p>
        <div class="task-sheet${unlockAnimClass}">
          <span class="label task-sheet-title">${escapeHtml(t.title)} ${taskDifficultyStarsHtml(t.difficulty)}</span>
          <div class="task-question task-q">${richMixedLinesToHtml(t.question)}</div>
          <div class="task-quiz-zone">
            ${taskAnswerGateHtml}
            ${formulaQuizHtml}
            ${escapeHatchHtml}
          </div>
          ${taskActionsHtml}
          <div class="${formulasClass}" id="formulas-box" aria-live="polite">
            <p class="answer-label">Wzory</p>
            ${formulasBody}
          </div>
          <div class="${ansClass}" id="task-answer" aria-live="polite">
            <p class="answer-label">Odpowiedź</p>
            <div class="answer-text">${richMixedLinesToHtml(t.answer)}</div>
          </div>
          <div class="${solClass}" id="task-solution" aria-live="polite">
            <p class="answer-label">Pełne rozwiązanie</p>
            ${solutionListHtml}
          </div>
          ${quizLegendHtml}
        </div>
        <div class="btn-row">
          <button type="button" class="btn btn-secondary" id="btn-task-prev"${canTaskPrev ? "" : " disabled"}>Poprzednie</button>
          <button type="button" class="btn btn-secondary" id="btn-task-next"${canTaskNext ? "" : " disabled"}>Następne</button>
        </div>
      `;

      queueMountKatex();
      requestAnimationFrame(() => {
        mountKatexIn(app);
      });

      if (needsLegacyQuizGate && fq) {
        app.querySelectorAll("[data-task-quiz-opt]").forEach((btn) => {
          btn.onclick = () => {
            if (taskQuizSolved) return;
            const i = Number(btn.getAttribute("data-task-quiz-opt"));
            if (Number.isNaN(i) || !fq.choices[i]) return;
            taskQuizPickIndex = i;
            if (fq.choices[i].correct) {
              taskQuizSolved = true;
              taskQuizUnlockAnim = true;
              celebrateSuccess();
              render();
            } else {
              render();
            }
          };
        });
      }

      const btnCheckMath = document.getElementById("btn-check-math");
      if (btnCheckMath) {
        btnCheckMath.onclick = () => {
          if (taskQuizSolved) return;
          const input = document.getElementById("task-math-input");
          const userVal = input instanceof HTMLInputElement ? input.value : "";
          taskMathInputDraft = userVal;
          if (checkMathAnswer(userVal, String(t.mathValue ?? ""))) {
            taskQuizSolved = true;
            taskQuizUnlockAnim = true;
            celebrateSuccess();
            render();
            return;
          }
          const gateEl = document.getElementById("task-answer-gate");
          handleTaskWrongAttempt(gateEl, () => {
            taskMathRevealed = true;
          });
        };
      }

      const abcdOpts = taskType === "abcd" ? (t.abcdOptions || []).slice(0, 4) : [];
      if (abcdOpts.length >= 4) {
        app.querySelectorAll("[data-task-abcd-opt]").forEach((btn) => {
          btn.onclick = () => {
            if (taskQuizSolved || taskAttempts >= 2) return;
            const i = Number(btn.getAttribute("data-task-abcd-opt"));
            if (Number.isNaN(i) || !abcdOpts[i]) return;
            taskQuizPickIndex = i;
            if (abcdOpts[i].isCorrect) {
              taskQuizSolved = true;
              taskQuizUnlockAnim = true;
              celebrateSuccess();
              render();
              return;
            }
            const gateEl = document.getElementById("task-answer-gate");
            handleTaskWrongAttempt(gateEl);
          };
        });
      }

      const btnEscape = document.getElementById("btn-escape-hatch");
      if (btnEscape) {
        btnEscape.onclick = () => unlockTaskWithSolution();
      }

      document.getElementById("btn-back-list").onclick = () => {
        history.back();
      };

      document.getElementById("btn-toggle-formulas").onclick = () => {
        taskFormulasVisible = !taskFormulasVisible;
        render();
      };

      document.getElementById("btn-toggle-answer").onclick = () => {
        if (gateLocked) return;
        taskAnswerVisible = !taskAnswerVisible;
        render();
      };

      document.getElementById("btn-toggle-solution").onclick = () => {
        if (gateLocked) return;
        taskSolutionVisible = !taskSolutionVisible;
        render();
      };

      document.getElementById("btn-task-prev").onclick = () => {
        navigateTaskBy(-1);
      };

      document.getElementById("btn-task-next").onclick = () => {
        navigateTaskBy(1);
      };
      return;
    }

    console.warn("render: nieobsługiwany screen —", screen);
    screen = "main";
    mainTab = "fiszki";
    app.innerHTML = `<div class="app-boot-error"><p class="flash-complete-title">Nieznany stan widoku. Wracam do menu.</p><button type="button" class="btn" id="btn-recover-screen">OK</button></div>`;
    const br = document.getElementById("btn-recover-screen");
    if (br) br.onclick = () => render();
      } finally {
        requestAnimationFrame(() => {
          updateTabSliders();
          updateAppBreadcrumb();
          syncRoleMockUi();
        });
      }
    };

    if (!document.startViewTransition) {
      performRender();
    } else {
      document.startViewTransition(() => {
        performRender();
      });
    }
  }

  function updateTabSliders() {
    if (!app) return;
    app.querySelectorAll(".tabs").forEach((container) => {
      const group = container.dataset.sliderGroup;
      const activeBtn = container.querySelector('.tab[aria-selected="true"]');
      if (!(activeBtn instanceof HTMLElement)) {
        container.style.setProperty("--slider-left", "0px");
        container.style.setProperty("--slider-width", "0px");
        if (group) sliderPositionsCache[group] = { left: 0, width: 0 };
        return;
      }
      const left = activeBtn.offsetLeft;
      const width = activeBtn.offsetWidth;
      if (group) sliderPositionsCache[group] = { left, width };
      container.style.setProperty("--slider-left", left + "px");
      container.style.setProperty("--slider-width", width + "px");
    });
  }

  window.addEventListener("resize", updateTabSliders);

  window.addEventListener("popstate", (e) => {
    if (e.state) {
      restoreAppHistory(e.state);
    } else {
      screen = "main";
      mainTab = "fiszki";
    }
    render();
  });

  boot();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          reg.update();
          reg.addEventListener("updatefound", () => {
            const nw = reg.installing;
            if (!nw) return;
            nw.addEventListener("statechange", () => {
              if (nw.state === "installed" && navigator.serviceWorker.controller) {
                console.info("[PWA] Dostępna nowa wersja — odśwież stronę.");
              }
            });
          });
        })
        .catch((err) => {
          console.warn("Rejestracja Service Workera nie powiodła się:", err);
        });
    });
  }

  /** @type {BeforeInstallPromptEvent | null} */
  let deferredPwaInstall = null;
  const pwaInstallBtn = document.getElementById("pwa-install");
  const pwaInstallHint = document.getElementById("pwa-install-hint");

  function isPwaStandalone() {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      /** @type {{ standalone?: boolean }} */ (window.navigator).standalone === true
    );
  }

  function isMobileUa() {
    return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  }

  function pwaManualInstallText() {
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      return "iOS: przycisk Udostępnij → Dodaj do ekranu początkowego.";
    }
    if (isMobileUa()) {
      return "Chrome: menu ⋮ (trzy kropki) → Zainstaluj aplikację lub Dodaj do ekranu.";
    }
    return "Chrome/Edge: ikona ⊕ w pasku adresu albo menu ⋮ → Zainstaluj Fizki.";
  }

  function showPwaInstallHint() {
    if (!pwaInstallHint || isPwaStandalone() || deferredPwaInstall) return;
    pwaInstallHint.textContent = pwaManualInstallText();
    pwaInstallHint.hidden = false;
  }

  if (!window.location.pathname.startsWith("/admin")) {
    window.addEventListener("beforeinstallprompt", (e) => {
      deferredPwaInstall = e;
      if (pwaInstallBtn) pwaInstallBtn.hidden = false;
      if (pwaInstallHint) pwaInstallHint.hidden = true;
    });

    if (pwaInstallBtn) {
      pwaInstallBtn.addEventListener("click", async () => {
        if (deferredPwaInstall) {
          deferredPwaInstall.prompt();
          await deferredPwaInstall.userChoice;
          deferredPwaInstall = null;
          pwaInstallBtn.hidden = true;
          return;
        }
        showPwaInstallHint();
      });
    }

    window.addEventListener("appinstalled", () => {
      deferredPwaInstall = null;
      if (pwaInstallBtn) pwaInstallBtn.hidden = true;
      if (pwaInstallHint) pwaInstallHint.hidden = true;
    });

    window.setTimeout(showPwaInstallHint, 4000);
  }

  const teacherModal = document.getElementById("teacher-modal");
  const teacherModalBody = document.getElementById("teacher-modal-body");
  const btnFindTeacher = document.getElementById("btn-find-teacher");
  const teacherModalClose = document.getElementById("teacher-modal-close");
  const teacherModalBackdrop = document.getElementById("teacher-modal-backdrop");
  let teachersRendered = false;

  function renderTeachers() {
    if (!teacherModalBody) return;

    teacherModalBody.innerHTML = MOCK_TEACHERS.map((teacher) => {
      const levelBadgesHtml = teacher.levels
        .map(
          (level) =>
            `<span class="teacher-level-badge">${escapeHtml(level)}</span>`
        )
        .join("");

      const slotsHtml = teacher.availableSlots
        .map(
          (slot) =>
            `<button type="button" class="time-slot-btn">${escapeHtml(slot)}</button>`
        )
        .join("");

      return `<article class="teacher-card" data-teacher-id="${escapeHtml(teacher.id)}">
        <div class="teacher-card-main">
          <div class="teacher-photo">
            <img class="teacher-avatar" src="${escapeHtml(teacher.photoUrl)}" alt="${escapeHtml(teacher.name)}" width="60" height="60" loading="lazy" decoding="async" />
          </div>
          <div class="teacher-info">
            <h3 class="teacher-name">${escapeHtml(teacher.name)}</h3>
            <p class="teacher-bio">${escapeHtml(teacher.bio)}</p>
            <p class="teacher-price"><strong>${escapeHtml(teacher.price)}</strong></p>
            <div class="teacher-levels">${levelBadgesHtml}</div>
          </div>
        </div>
        <button type="button" class="teacher-toggle-slots" data-teacher-id="${escapeHtml(teacher.id)}">Zobacz wolne terminy</button>
        <div class="teacher-calendar">${slotsHtml}</div>
      </article>`;
    }).join("");

    teachersRendered = true;
  }

  /** @param {MouseEvent} ev */
  function onTeacherModalBodyClick(ev) {
    const target = ev.target;
    if (!(target instanceof Element)) return;

    const toggleBtn = target.closest(".teacher-toggle-slots");
    if (!toggleBtn || !teacherModalBody || !teacherModalBody.contains(toggleBtn)) return;

    const card = toggleBtn.closest(".teacher-card");
    if (!card) return;

    const expanded = card.classList.toggle("show-calendar");
    toggleBtn.textContent = expanded ? "Ukryj terminy" : "Zobacz wolne terminy";
  }

  function openTeacherModal() {
    if (!teacherModal) return;
    if (!teachersRendered) renderTeachers();
    teacherModal.hidden = false;
    teacherModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("teacher-modal-open");
    if (teacherModalClose) teacherModalClose.focus();
  }

  function closeTeacherModal() {
    if (!teacherModal) return;
    teacherModal.hidden = true;
    teacherModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("teacher-modal-open");
    if (btnFindTeacher) btnFindTeacher.focus();
  }

  if (btnFindTeacher) {
    btnFindTeacher.addEventListener("click", openTeacherModal);
  }
  if (teacherModalBody) {
    renderTeachers();
    teacherModalBody.addEventListener("click", onTeacherModalBodyClick);
  }
  if (teacherModalClose) {
    teacherModalClose.addEventListener("click", closeTeacherModal);
  }
  if (teacherModalBackdrop) {
    teacherModalBackdrop.addEventListener("click", closeTeacherModal);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const loginModalEl = document.getElementById("login-modal");
    if (loginModalEl && !loginModalEl.classList.contains("hidden")) {
      closeLoginModal(loginModalEl);
      const openBtn = document.getElementById("btn-open-login");
      if (openBtn instanceof HTMLElement) openBtn.focus();
      return;
    }
    const studentModalEl = document.getElementById("student-dashboard");
    if (studentModalEl && !studentModalEl.classList.contains("hidden")) {
      closeStudentModal(studentModalEl);
      const profileStudent = document.getElementById("profile-student");
      if (profileStudent instanceof HTMLElement) profileStudent.focus();
      return;
    }
    const teacherDashboardEl = document.getElementById("teacher-dashboard");
    if (teacherDashboardEl && !teacherDashboardEl.classList.contains("hidden")) {
      closeTeacherDashboardModal(teacherDashboardEl);
      const profileTeacher = document.getElementById("profile-teacher");
      if (profileTeacher instanceof HTMLElement) profileTeacher.focus();
      return;
    }
    const quizCreatorEl = document.getElementById("quiz-creator-modal");
    if (quizCreatorEl && !quizCreatorEl.classList.contains("hidden")) {
      closeQuizCreatorModal(quizCreatorEl);
      const btnOpenQuiz = document.getElementById("btn-open-quiz-creator");
      if (btnOpenQuiz instanceof HTMLElement) btnOpenQuiz.focus();
      return;
    }
    if (teacherModal && !teacherModal.hidden) {
      closeTeacherModal();
    }
  });

  const studentModal = document.getElementById("student-dashboard");
  const profileStudent = document.getElementById("profile-student");
  const studentModalBackdrop = document.getElementById("student-modal-backdrop");
  const studentModalClose = document.getElementById("student-modal-close");

  if (profileStudent) {
    profileStudent.addEventListener("click", (ev) => {
      const target = ev.target;
      if (target instanceof Element && target.closest("[data-auth-logout]")) return;
      openStudentModal(studentModal);
    });
    profileStudent.addEventListener("keydown", (ev) => {
      if (ev.key !== "Enter" && ev.key !== " ") return;
      if (ev.target instanceof Element && ev.target.closest("[data-auth-logout]")) return;
      ev.preventDefault();
      openStudentModal(studentModal);
    });
  }
  if (studentModalClose) {
    studentModalClose.addEventListener("click", () => closeStudentModal(studentModal));
  }
  if (studentModalBackdrop) {
    studentModalBackdrop.addEventListener("click", () => closeStudentModal(studentModal));
  }

  const teacherDashboardModal = document.getElementById("teacher-dashboard");
  const profileTeacher = document.getElementById("profile-teacher");
  const teacherDashboardBackdrop = document.getElementById("teacher-dashboard-backdrop");
  const teacherDashboardClose = document.getElementById("teacher-dashboard-close");

  if (profileTeacher) {
    profileTeacher.addEventListener("click", (ev) => {
      const target = ev.target;
      if (target instanceof Element && target.closest("[data-auth-logout]")) return;
      openTeacherDashboardModal(teacherDashboardModal);
    });
    profileTeacher.addEventListener("keydown", (ev) => {
      if (ev.key !== "Enter" && ev.key !== " ") return;
      if (ev.target instanceof Element && ev.target.closest("[data-auth-logout]")) return;
      ev.preventDefault();
      openTeacherDashboardModal(teacherDashboardModal);
    });
  }
  if (teacherDashboardClose) {
    teacherDashboardClose.addEventListener("click", () =>
      closeTeacherDashboardModal(teacherDashboardModal)
    );
  }
  if (teacherDashboardBackdrop) {
    teacherDashboardBackdrop.addEventListener("click", () =>
      closeTeacherDashboardModal(teacherDashboardModal)
    );
  }

  const tViewMain = document.getElementById("t-view-main");
  const tViewClassDetail = document.getElementById("t-view-class-detail");
  const tDetailTitle = document.getElementById("t-detail-title");
  const tClassStudents = document.getElementById("t-class-students");
  const tClassEmpty = document.getElementById("t-class-empty");
  const teacherClassCodeEl = document.getElementById("teacher-class-code");
  const btnTViewBack = document.getElementById("btn-t-view-back");
  const btnTAddClass = document.getElementById("btn-t-add-class");

  document.querySelectorAll(".t-class-nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const strong = btn.querySelector("strong");
      const className = strong instanceof HTMLElement ? strong.innerText.trim() : "";
      const classCode = btn.getAttribute("data-class-code") || "";
      if (tDetailTitle instanceof HTMLElement && className) {
        tDetailTitle.innerText = className;
      }
      if (teacherClassCodeEl instanceof HTMLElement && classCode) {
        teacherClassCodeEl.textContent = classCode;
      }
      const hasStudents = className === "Klasa 3B";
      if (tClassStudents) tClassStudents.classList.toggle("hidden", !hasStudents);
      if (tClassEmpty) tClassEmpty.classList.toggle("hidden", hasStudents);
      if (tViewMain) tViewMain.classList.add("hidden");
      if (tViewClassDetail) {
        tViewClassDetail.classList.remove("hidden");
        tViewClassDetail.setAttribute("aria-hidden", "false");
      }
    });
  });

  if (btnTViewBack) {
    btnTViewBack.addEventListener("click", () => {
      if (tViewClassDetail) {
        tViewClassDetail.classList.add("hidden");
        tViewClassDetail.setAttribute("aria-hidden", "true");
      }
      if (tViewMain) tViewMain.classList.remove("hidden");
      document.querySelectorAll("#t-view-class-detail .t-student-header").forEach((header) => {
        header.classList.remove("is-open");
      });
      document.querySelectorAll("#t-view-class-detail .t-student-body").forEach((body) => {
        body.classList.add("hidden");
      });
    });
  }

  document.querySelectorAll("#t-view-class-detail .t-student-header").forEach((header) => {
    header.addEventListener("click", () => {
      if (!(header instanceof HTMLElement)) return;
      const targetId = header.getAttribute("data-toggle-target");
      if (!targetId) return;
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.classList.toggle("hidden");
        header.classList.toggle("is-open");
      }
    });
  });

  if (btnTAddClass instanceof HTMLButtonElement) {
    btnTAddClass.addEventListener("click", () => {
      showToast("✅ Utworzono nową klasę!");
    });
  }

  const loginModal = document.getElementById("login-modal");
  const btnOpenLogin = document.getElementById("btn-open-login");
  const loginModalBackdrop = document.getElementById("login-modal-backdrop");
  const loginModalClose = document.getElementById("login-modal-close");
  const btnDemoStudent = document.getElementById("btn-login-demo-student");
  const btnDemoTeacher = document.getElementById("btn-login-demo-teacher");

  if (btnOpenLogin) {
    btnOpenLogin.addEventListener("click", () => openLoginModal(loginModal));
  }
  if (loginModalClose) {
    loginModalClose.addEventListener("click", () => closeLoginModal(loginModal));
  }
  if (loginModalBackdrop) {
    loginModalBackdrop.addEventListener("click", () => closeLoginModal(loginModal));
  }
  if (btnDemoStudent) {
    btnDemoStudent.addEventListener("click", () => {
      handleLoginStudent();
      closeLoginModal(loginModal);
    });
  }
  if (btnDemoTeacher) {
    btnDemoTeacher.addEventListener("click", () => {
      handleLoginTeacher();
      closeLoginModal(loginModal);
    });
  }

  const studentSelectLevel = document.getElementById("student-level-select");
  const studentSelectGrade = document.getElementById("student-grade-select");
  if (studentSelectLevel instanceof HTMLSelectElement) {
    studentSelectLevel.addEventListener("change", onStudentLevelSelectChange);
  }
  if (studentSelectGrade instanceof HTMLSelectElement) {
    studentSelectGrade.addEventListener("change", onStudentGradeSelectChange);
  }

  document.querySelectorAll("[data-auth-logout]").forEach((btn) => {
    btn.addEventListener("click", resetMockAuth);
  });

  const btnCopyClassCode = document.getElementById("btn-copy-class-code");
  if (btnCopyClassCode instanceof HTMLButtonElement) {
    btnCopyClassCode.addEventListener("click", () => {
      if (btnCopyClassCode.disabled) return;
      const codeEl = document.getElementById("teacher-class-code");
      const code = codeEl instanceof HTMLElement ? codeEl.textContent?.trim() || "" : "";
      if (!code) return;
      const copied = () => {
        btnCopyClassCode.textContent = "✅ Skopiowano!";
        if (copyClassCodeTimerId) clearTimeout(copyClassCodeTimerId);
        copyClassCodeTimerId = window.setTimeout(() => {
          btnCopyClassCode.textContent = COPY_CLASS_CODE_BTN_LABEL;
          copyClassCodeTimerId = null;
        }, 2000);
      };
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        navigator.clipboard.writeText(code).then(copied).catch(copied);
      } else {
        copied();
      }
    });
  }

  const btnJoinClass = document.getElementById("btn-join-class");
  const inputJoinCode = document.getElementById("input-join-code");
  if (btnJoinClass instanceof HTMLButtonElement) {
    btnJoinClass.addEventListener("click", () => {
      if (inputJoinCode instanceof HTMLInputElement) inputJoinCode.value = "";
      closeStudentModal();
      showToast("✅ Dołączono do klasy! Twój nauczyciel widzi Twoje postępy.");
    });
  }

  const quizCreatorModal = document.getElementById("quiz-creator-modal");
  const btnOpenQuizCreator = document.getElementById("btn-open-quiz-creator");
  const btnShareQuiz = document.getElementById("btn-share-quiz");
  const quizCreatorClose = document.getElementById("quiz-creator-close");
  const quizCreatorBackdrop = document.getElementById("quiz-creator-backdrop");

  if (btnOpenQuizCreator instanceof HTMLButtonElement) {
    btnOpenQuizCreator.addEventListener("click", () => openQuizCreatorModal(quizCreatorModal));
  }
  if (quizCreatorClose) {
    quizCreatorClose.addEventListener("click", () => closeQuizCreatorModal(quizCreatorModal));
  }
  if (quizCreatorBackdrop) {
    quizCreatorBackdrop.addEventListener("click", () => closeQuizCreatorModal(quizCreatorModal));
  }
  if (btnShareQuiz instanceof HTMLButtonElement) {
    btnShareQuiz.addEventListener("click", () => {
      closeQuizCreatorModal(quizCreatorModal);
      showToast("✅ Sprawdzian został przypisany do Klasy 3B!");
    });
  }

  syncRoleMockUi();
})();
