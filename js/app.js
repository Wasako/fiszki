(function () {
  "use strict";

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
   * Quiz fiszek wyłącznie z JSON: `correct_latex` → `back`, `distractors` → `quizDistractors`
   * (bez dynamicznych dystraktorów). Kolejność opcji po **Fisher–Yates**.
   * @param {{ back: string, quizDistractors?: string[] | null }} card
   * @returns {{ choices: string[], correctIndex: number }}
   */
  function buildFlashQuizChoices(card) {
    const norm = (x) => String(x).replace(/\s+/g, " ").trim();
    const correct = physicsPlainToLatex(String(card.back || "")).trim();
    const raw = Array.isArray(card.quizDistractors) ? card.quizDistractors : [];
    const wrongs = [];
    for (const d of raw) {
      const w = physicsPlainToLatex(String(d)).trim();
      if (!w || norm(w) === norm(correct)) continue;
      if (wrongs.some((u) => norm(u) === norm(w))) continue;
      wrongs.push(w);
      if (wrongs.length >= 3) break;
    }
    const pool = [correct, ...wrongs];
    const choices = fisherYatesShuffle(pool);
    let correctIndex = choices.findIndex((x) => norm(x) === norm(correct));
    if (correctIndex < 0) correctIndex = 0;
    return { choices, correctIndex };
  }

  /**
   * Czy warianty quizu są na tyle krótkie, że sensowny jest układ 2×2 (mniej przewijania).
   * @param {string[]} choices
   */
  function flashQuizUseCompactGrid2x2(choices) {
    if (!Array.isArray(choices) || choices.length !== 4) return false;
    for (const tex of choices) {
      const s = String(tex).replace(/\s+/g, " ").trim();
      if (s.length > 96) return false;
      if (/\\begin\b/.test(s)) return false;
    }
    return true;
  }

  /**
   * Czy zadanie wymaga bramki quizu (4 warianty formulaQuiz).
   * @param {object} t
   */
  function taskNeedsQuizGate(t) {
    const fq = t && t.formulaQuiz;
    return Boolean(fq && Array.isArray(fq.choices) && fq.choices.length >= 4);
  }

  /**
   * Lewa strona wzoru (wielkość przed pierwszym =, ≤, ≥, ≈) do nagłówka quizu fiszek.
   * @param {string} fullTex
   * @returns {string|null}
   */
  function extractFlashQuizHeadSymbolLatex(fullTex) {
    const t = String(fullTex || "").trim();
    if (!t) return null;
    const relMarkers = ["=", "\\le", "\\ge", "\\approx"];
    let cut = -1;
    let depth = 0;
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      if (c === "{") depth++;
      else if (c === "}") depth = Math.max(0, depth - 1);
      if (depth !== 0) continue;
      for (const m of relMarkers) {
        if (t.startsWith(m, i)) {
          cut = i;
          break;
        }
      }
      if (cut >= 0) break;
    }
    if (cut <= 0) return null;
    let lhs = t.slice(0, cut).trim();
    if (!lhs || /\\begin\b/.test(lhs)) return null;
    if (lhs.length > 72) return null;
    return lhs;
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
      symbolLatex: row.symbol != null && String(row.symbol).trim() ? String(row.symbol).trim() : null,
      quizDistractors: Array.isArray(row.distractors)
        ? row.distractors.map((d) => String(d).trim()).filter(Boolean)
        : null,
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

  /** Tematy niewidoczne w „Szkoła podstawowa” (dostępne od liceum). */
  const WZORY_EXCLUDE_SP_TOPICS = new Set([
    ...WZORY_ROZ_ONLY_TOPICS,
    "Elementy fizyki atomowej i jądrowej",
    "Wybrane zależności",
    "Wartości wybranych stałych fizycznych — cd.",
    "Wartości wybranych jednostek spoza układu SI",
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
   * W SP nie pokazujemy całych działów z `WZORY_EXCLUDE_SP_TOPICS`.
   * W wybranych działach — tylko karty z białej listy (węższy zakres niż liceum).
   * @type {Record<string, Set<string>>}
   */
  const WZORY_SP_TOPIC_CARD_WHITELIST = {
    Kinematyka: new Set([
      "Średnia prędkość na prostej (droga i czas)",
      "Droga w ruchu jednostajnym prostoliniowym (skalar)",
    ]),
    Dynamika: new Set([
      "Pęd",
      "II zasada dynamiki (układ inercjalny)",
      "Praca siły",
      "Energia kinetyczna ruchu postępowego",
      "Moc",
    ]),
    "Grawitacja i elementy astronomii": new Set([
      "Prawo powszechnego ciążenia",
      "Natężenie pola grawitacyjnego i przyspieszenie grawitacyjne",
      "Energia potencjalna grawitacji",
      "Zmiana energii potencjalnej przy powierzchni Ziemi",
    ]),
    "Drgania, fale mechaniczne i świetlne": new Set([
      "Prędkość fali (długość, okres, częstotliwość)",
      "Prawo Snelliusa (załamanie na granicy ośrodków)",
    ]),
    Termodynamika: new Set([
      "I zasada termodynamiki",
      "Praca siły parcia przy stałym ciśnieniu",
      "Praca siły parcia a wykres p(V)",
      "Ciepło właściwe",
      "Ciepło przemiany fazowej",
      "Równanie stanu gazu doskonałego (Clapeyrona)",
    ]),
    Elektrostatyka: new Set([
      "Prawo Coulomba i stała elektrostatyczna",
      "Natężenie pola elektrycznego",
      "Natężenie pola na zewnątrz sferycznego rozkładu ładunku",
      "Napięcie a potencjały elektryczne",
      "Napięcie w polu jednorodnym",
      "Pojemność kondensatora",
    ]),
    "Prąd elektryczny": new Set([
      "Natężenie prądu",
      "Definicja oporu przewodnika",
      "Prawo Ohma (dla stałej temperatury przewodnika)",
      "Opór przewodnika z drutu",
      "Moc prądu stałego na oporniku",
      "Dodawanie napięć między punktami przewodnika",
      "Opór zastępczy połączenia szeregowego",
      "Opór zastępczy połączenia równoległego",
    ]),
    Magnetyzm: new Set([
      "Siła Lorentza (wartość; kąt między v i B)",
      "Siła elektrodynamiczna na odcinku przewodnika",
      "Pole magnetyczne długiego prostoliniowego przewodnika",
      "Pole wewnątrz długiej ciasnej zwojnicy",
      "Strumień magnetyczny przez powierzchnię",
      "SEM indukcji (Faraday–Lenz)",
    ]),
  };

  /**
   * @param {{ topic: string, front: string }} card
   * @param {string} homeLevelId
   */
  function cardVisibleForHomeLevel(card, homeLevelId) {
    if (homeLevelId === "lo-rozszerzenie") return true;
    if (WZORY_ROZ_ONLY_TOPICS.has(card.topic)) return false;
    if (homeLevelId === "lo-podstawa") {
      if (WZORY_EXCLUDE_LO_P_CARD_KEYS.has(sheetCardRefKey(card))) return false;
      return true;
    }
    if (homeLevelId === "sp") {
      if (WZORY_EXCLUDE_SP_TOPICS.has(card.topic)) return false;
      const wl = WZORY_SP_TOPIC_CARD_WHITELIST[card.topic];
      if (wl) return wl.has(card.front);
      return true;
    }
    return true;
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
   * @typedef {{ title: string, question: string, answer: string, formulas?: string[], sheetFormulas?: string[], sheetCardRefs?: (string|[string, string])[], laws?: string[], solutionSteps?: string[], formulaQuiz?: { lhsLatex?: string, prompt?: string, choices?: { katex: string, correct?: boolean, distractorRationale?: string }[] } }} Task
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

  function orderedHomeLevelIds() {
    return HOME_LEVEL_TAB_ORDER.slice();
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
    "lo-p-k2-hyd-1": ["materiał"],
    "lo-p-k3-ele-3": ["elektryczność"],
  };

  const SP_CURRICULUM_LINKS = {
    "sp-k7-kin-2": ["ruch"],
    "sp-k7-dyn-3": ["dynamika"],
    "sp-k7-pme-1": ["praca"],
    "sp-k7-w-4": ["materiał"],
    "sp-k8-prad-3": ["elektryczność"],
  };

  /** Zadania wyłącznie z `zadania.json` w katalogu głównym (bramka `formulaQuiz` w `task-detail`). */
  async function loadZadaniaJson() {
    const res = await fetch("zadania.json");
    if (!res.ok) throw new Error("HTTP " + res.status + " — zadania.json");
    const data = await res.json();
    const levels = Array.isArray(data) ? data : [];
    if (levels.length === 0) throw new Error("zadania.json: pusta tablica poziomów");
    for (const lvl of levels) {
      lvl.sections = Array.isArray(lvl.sections) ? lvl.sections : [];
      for (const sec of lvl.sections) {
        sec.tasks = Array.isArray(sec.tasks) ? sec.tasks : [];
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

  async function boot() {
    showAppLoadingState();
    try {
      await loadFiszkiWzory();
      await loadZadaniaJson();
      if (!TASK_LEVELS.some((l) => l.id === homeLevelId)) {
        homeLevelId = TASK_LEVELS[0].id;
      }
      await loadCurriculaAndLinks();
      render();
    } catch (e) {
      console.error(e);
      showAppBootError();
    }
  }

  const app = document.getElementById("app");

  /** @type {'main' | 'flash-study' | 'flash-complete' | 'task-chapters' | 'task-detail'} */
  let screen = "main";
  /** @type {'fiszki' | 'zadania' | 'karta-wzorow'} */
  let mainTab = "fiszki";

  /** Id poziomu z `TASK_LEVELS` — wybór na górze menu głównego (zadania i opis zakładki Zadania). */
  let homeLevelId = "lo-rozszerzenie";

  /** Indeks działu (topic) na karcie wzorów — zapamiętywany przy przełączaniu zakładek. */
  let sheetTopicIndex = 0;

  let flashIndex = 0;
  let deck = [];

  /** @type {number | null} wybrany wariant quizu fiszek (0–3), null przed odpowiedzią */
  let flashQuizPicked = null;
  /** @type {{ index: number, choices: string[], correctIndex: number } | null} */
  let flashQuizCache = null;

  /** @type {string | null} */
  let taskLevelId = null;
  /** @type {string | null} */
  let taskSectionId = null;
  /** Ścieżka w planie programu (id węzłów) — do nawigacji po klasach i działach. */
  /** @type {string[]} */
  let taskCurriculumPath = [];
  let taskIndex = 0;
  let taskAnswerVisible = false;
  let taskFormulasVisible = false;
  let taskSolutionVisible = false;

  let lastTaskQuizGateKey = "";
  let taskQuizPickIndex = null;
  let taskQuizSolved = false;
  /** Jednorazowa animacja po poprawnej odpowiedzi w bramce zadania. */
  let taskQuizUnlockAnim = false;

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

  /**
   * @param {SchoolLevel} level
   * @param {string[]} pathIds
   */
  function getCurriculumChildren(level, pathIds) {
    const cur = level.curriculum;
    if (!cur) return null;
    let nodes = cur;
    for (const pid of pathIds) {
      const next = nodes.find((n) => n.id === pid);
      if (!next || !hasNodeChildren(next)) return [];
      nodes = /** @type {TopicSection[]} */ (next.children);
    }
    return nodes;
  }

  /** @param {TopicSection} node */
  function getLeafSectionRefs(node) {
    if (!node) return [];
    if (Array.isArray(node.sectionRefs) && node.sectionRefs.length) return node.sectionRefs.slice();
    if (node.sectionRef) return [node.sectionRef];
    return [];
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

  function countTasksInLevel(level) {
    return level.sections.reduce((n, s) => n + s.tasks.length, 0);
  }

  function countCurriculumTopNodes(level) {
    if (level.curriculum && level.curriculum.length) return level.curriculum.length;
    return level.sections.length;
  }

  /**
   * @param {SchoolLevel} level
   * @param {TopicSection} node
   */
  function countTasksOnCurriculumNode(level, node) {
    if (!hasNodeChildren(node)) {
      const v = getTaskSectionView(level, node.id);
      return v && Array.isArray(v.tasks) ? v.tasks.length : 0;
    }
    let n = 0;
    for (const c of node.children || []) n += countTasksOnCurriculumNode(level, c);
    return n;
  }

  /**
   * @param {SchoolLevel} level
   * @param {string[]} pathIds
   */
  function curriculumBreadcrumbTitles(level, pathIds) {
    const parts = [level.title];
    let nodes = level.curriculum;
    for (const pid of pathIds) {
      const n = nodes ? nodes.find((x) => x.id === pid) : null;
      if (!n) break;
      parts.push(n.title);
      nodes = n.children || null;
    }
    return parts;
  }

  /** @param {number} n */
  function tasksLabel(n) {
    if (n === 1) return "1 zadanie";
    const m10 = n % 10;
    const m100 = n % 100;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return n + " zadania";
    return n + " zadań";
  }

  /** @param {number} n */
  function chaptersLabel(n) {
    if (n === 1) return "1 dział";
    const m10 = n % 10;
    const m100 = n % 100;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return n + " działy";
    return n + " działów";
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

  /**
   * @param {{ topic: string, front: string, back: string }[]} cards
   */
  function renderSheetTopicCardsHtml(cards) {
    return cards
      .map((c) => {
        const leg = symbolLegendBlockHtml(getCardSymbolLegendEntries(c));
        return `<article class="sheet-card"><h4 class="sheet-card-title">${escapeHtml(c.front)}</h4><div class="sheet-formula">${katexHostHtml(
          physicsPlainToLatex(c.back),
          true
        )}</div>${leg}</article>`;
      })
      .join("");
  }

  function renderKartaWzorowPanelHtml() {
    const groups = groupCardsByTopicInOrder(cardsForHomeLevel(homeLevelId));
    if (groups.length === 0) {
      return `<p class="hint">Brak fiszek wzorów.</p>`;
    }
    sheetTopicIndex = Math.max(0, Math.min(sheetTopicIndex, groups.length - 1));
    const optionsHtml = groups
      .map(
        (g, i) =>
          `<option value="${i}"${i === sheetTopicIndex ? " selected" : ""}>${escapeHtml(g.topic)} (${g.cards.length})</option>`
      )
      .join("");
    const bodyHtml = renderSheetTopicCardsHtml(groups[sheetTopicIndex].cards);
    return `<div class="sheet-layout">
      <nav class="sheet-topic-nav" aria-label="Dział wzorów">
        <label class="sheet-topic-label" for="sheet-topic-select">Dział</label>
        <select id="sheet-topic-select" class="sheet-topic-select">${optionsHtml}</select>
      </nav>
      <div class="sheet-scroll sheet-topic-content" id="sheet-topic-body">${bodyHtml}</div>
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

  function bindMainScreen() {
    const tabFiszki = document.getElementById("tab-fiszki");
    const tabKartaWzorow = document.getElementById("tab-karta-wzorow");
    const tabZadania = document.getElementById("tab-zadania");
    const panelFiszki = document.getElementById("panel-fiszki");
    const panelKartaWzorow = document.getElementById("panel-karta-wzorow");
    const panelZadania = document.getElementById("panel-zadania");

    function setTab(tab) {
      mainTab = tab;
      tabFiszki.setAttribute("aria-selected", tab === "fiszki" ? "true" : "false");
      tabKartaWzorow.setAttribute("aria-selected", tab === "karta-wzorow" ? "true" : "false");
      tabZadania.setAttribute("aria-selected", tab === "zadania" ? "true" : "false");
      panelFiszki.hidden = tab !== "fiszki";
      panelKartaWzorow.hidden = tab !== "karta-wzorow";
      panelZadania.hidden = tab !== "zadania";
    }

    tabFiszki.onclick = () => setTab("fiszki");
    tabKartaWzorow.onclick = () => setTab("karta-wzorow");
    tabZadania.onclick = () => {
      mainTab = "zadania";
      taskLevelId = homeLevelId;
      taskSectionId = null;
      taskIndex = 0;
      taskAnswerVisible = false;
      taskFormulasVisible = false;
      taskSolutionVisible = false;
      taskCurriculumPath = [];
      screen = "task-chapters";
      render();
    };
    setTab(mainTab);

    document.getElementById("btn-order").onclick = () => {
      deck = cardsForHomeLevel(homeLevelId).slice();
      flashIndex = 0;
      flashQuizPicked = null;
      flashQuizCache = null;
      screen = "flash-study";
      render();
    };
    document.getElementById("btn-random").onclick = () => {
      deck = fisherYatesShuffle(cardsForHomeLevel(homeLevelId));
      flashIndex = 0;
      flashQuizPicked = null;
      flashQuizCache = null;
      screen = "flash-study";
      render();
    };

    document.querySelectorAll("[data-home-level]").forEach((btn) => {
      btn.onclick = () => {
        const id = btn.getAttribute("data-home-level");
        if (!id || !getLevel(id)) return;
        homeLevelId = id;
        sheetTopicIndex = 0;
        deck = cardsForHomeLevel(homeLevelId).slice();
        taskCurriculumPath = [];
        if (screen === "task-chapters" && taskLevelId != null) {
          taskLevelId = homeLevelId;
          taskSectionId = null;
          taskIndex = 0;
          taskAnswerVisible = false;
          taskFormulasVisible = false;
          taskSolutionVisible = false;
        }
        render();
      };
    });

    const sheetTopicSel = document.getElementById("sheet-topic-select");
    if (sheetTopicSel) {
      sheetTopicSel.addEventListener("change", applySheetTopicSelectChange);
      sheetTopicSel.addEventListener("input", applySheetTopicSelectChange);
    }
  }

  function render() {
    if (screen === "flash-study" || screen === "flash-complete") {
      lastTaskQuizGateKey = "";
      taskQuizPickIndex = null;
      taskQuizSolved = false;
      taskQuizUnlockAnim = false;
    } else if (screen === "task-chapters" || screen === "task-detail") {
      flashQuizPicked = null;
      flashQuizCache = null;
    }

    if (screen === "main") {
      let hl = getLevel(homeLevelId) || TASK_LEVELS[0];
      if (!hl) {
        const fid = HOME_LEVEL_TAB_ORDER[0];
        hl = { id: fid, title: HOME_LEVEL_FALLBACK_TITLES[fid] || fid, sections: [] };
      }
      homeLevelId = hl.id;

      const homeLevelTabsHtml = orderedHomeLevelIds()
        .map((id) => {
          const lvl = getLevel(id);
          const label =
            lvl && String(lvl.title || "").trim() ? lvl.title : HOME_LEVEL_FALLBACK_TITLES[id] || id;
          const sel = id === homeLevelId ? "true" : "false";
          return `<button type="button" class="tab" role="tab" data-home-level="${escapeHtml(id)}" aria-selected="${sel}">${escapeHtml(
            label
          )}</button>`;
        })
        .join("");

      const wzoryCount = cardsForHomeLevel(hl.id).length;

      app.innerHTML = `
        <h1>Fizyka</h1>
        <p class="sub">Wzory z karty CKE, fiszki i zadania — wybierz poziom, potem zakładkę. <strong>Zadania</strong> otwierają od razu listę planu programu / działów.</p>
        <div class="tabs tabs-level" role="tablist" aria-label="Poziom zaawansowania">
          ${homeLevelTabsHtml}
        </div>
        <div class="tabs tabs-main" role="tablist" aria-label="Treść">
          <button type="button" class="tab" role="tab" id="tab-fiszki" aria-selected="true">Fiszki</button>
          <button type="button" class="tab" role="tab" id="tab-karta-wzorow" aria-selected="false">Karta wzorów</button>
          <button type="button" class="tab" role="tab" id="tab-zadania" aria-selected="false">Zadania</button>
        </div>
        <div id="panel-fiszki" role="tabpanel" aria-labelledby="tab-fiszki">
          <p class="panel-title">Quiz — rozpoznaj wzór</p>
          <p class="sub panel-sub" style="margin-top:-0.35rem">Poziom: <strong>${escapeHtml(hl.title)}</strong> — w zestawie <strong>${wzoryCount}</strong> wzorów. Cztery warianty LaTeXu; po odpowiedzi podświetlenie wariantów oraz pełna fiszka z legendą symboli.</p>
          <div class="intro-actions">
            <button type="button" class="btn" id="btn-order">Nauka (kolejność)</button>
            <button type="button" class="btn btn-secondary" id="btn-random">Nauka (losowo)</button>
          </div>
        </div>
        <div id="panel-karta-wzorow" role="tabpanel" aria-labelledby="tab-karta-wzorow" hidden>
          <p class="panel-title">Karta wzorów (CKE)</p>
          <p class="sub panel-sub">Poziom: <strong>${escapeHtml(hl.title)}</strong> — wybierz dział z menu (tylko wzory dla tego poziomu). Pod wzorem — legenda symboli.</p>
          <div class="sheet-panel-wrap">${renderKartaWzorowPanelHtml()}</div>
        </div>
        <div id="panel-zadania" role="tabpanel" aria-labelledby="tab-zadania" hidden></div>
      `;
      bindMainScreen();
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
          screen = "main";
          mainTab = "fiszki";
          flashQuizPicked = null;
          flashQuizCache = null;
          render();
        };
      }
      return;
    }

    else if (screen === "flash-study") {
      if (deck.length === 0) {
        screen = "main";
        render();
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
      const headSymbolTex =
        (card.symbolLatex && String(card.symbolLatex).trim()) || extractFlashQuizHeadSymbolLatex(correctLatex);
      const titleSuffixHtml =
        headSymbolTex != null && headSymbolTex !== ""
          ? ' <span class="quiz-head-symbol">(' + katexHostHtml(headSymbolTex, false) + ")</span>"
          : "";
      const quizOptsGridClass = flashQuizUseCompactGrid2x2(quiz.choices)
        ? "quiz-options quiz-options--grid2"
        : "quiz-options quiz-options--stack";

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
            <div class="sheet-formula quiz-option-formula">${katexHostHtml(tex, true)}</div>
          </button>`;
        })
        .join("");

      const revealHtml = showFullCard
        ? `<div class="quiz-full-card" aria-live="polite">
            <span class="label">Pełna fiszka</span>
            <p class="quiz-full-topic">${escapeHtml(card.topic)} — ${escapeHtml(card.front)}</p>
            <div class="sheet-formula">${katexHostHtml(correctLatex, true)}</div>
            ${symbolLegendBlockHtml(getCardSymbolLegendEntries(card))}
          </div>`
        : "";

      app.innerHTML = `
        <div class="top-bar">
          <button type="button" class="btn btn-secondary btn-back" id="btn-main">← Menu</button>
          <h1>Fiszki — quiz</h1>
        </div>
        <p class="progress">${flashIndex + 1} / ${deck.length}</p>
        <div class="quiz-scene">
          <div class="quiz-card">
            <span class="label">${escapeHtml(card.topic)}</span>
            <p class="quiz-question-title">${escapeHtml(card.front)}${titleSuffixHtml}</p>
            <div class="${quizOptsGridClass}" role="group" aria-label="Warianty odpowiedzi">
              ${optionsHtml}
            </div>
            ${revealHtml}
          </div>
        </div>
        <div class="btn-row">
          <button type="button" class="btn btn-secondary" id="btn-prev">Wstecz</button>
          <button type="button" class="btn btn-secondary" id="btn-next">Dalej</button>
        </div>
      `;

      document.getElementById("btn-main").onclick = () => {
        screen = "main";
        mainTab = "fiszki";
        flashQuizPicked = null;
        flashQuizCache = null;
        render();
      };

      app.querySelectorAll("[data-quiz-opt]").forEach((btn) => {
        btn.onclick = () => {
          if (flashQuizPicked !== null) return;
          const i = Number(btn.getAttribute("data-quiz-opt"));
          if (Number.isNaN(i)) return;
          flashQuizPicked = i;
          render();
        };
      });

      document.getElementById("btn-prev").onclick = () => {
        if (flashIndex > 0) {
          flashIndex -= 1;
          flashQuizPicked = null;
          flashQuizCache = null;
          render();
        }
      };

      document.getElementById("btn-next").onclick = () => {
        if (flashIndex < deck.length - 1) {
          flashIndex += 1;
          flashQuizPicked = null;
          flashQuizCache = null;
          render();
        } else if (flashQuizPicked !== null) {
          screen = "flash-complete";
          flashQuizPicked = null;
          flashQuizCache = null;
          render();
        }
      };
      queueMountKatex();
      return;
    }

    else if (screen === "task-chapters") {
      const level = taskLevelId ? getLevel(taskLevelId) : null;
      if (!level) {
        screen = "main";
        render();
        return;
      }

      /** Lista zadań w wybranym dziale / liściu programu — ten sam ekran co drzewo (bez pośredniego „pustego” kroku). */
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
          ${escapeHtml(t.title)}
        </button>`
                )
                .join("")
            : `<p class="hint" style="margin:0">Brak zadań w tej pozycji programu. Wybierz inny temat lub dopisz zestaw w JSON.</p>`;

        const crumb = level.curriculum
          ? `<p class="curriculum-crumb">${escapeHtml(curriculumBreadcrumbTitles(level, taskCurriculumPath).join(" › "))}</p>`
          : "";

        const backListLabel = level.curriculum ? "← Plan programu" : "← Działy";

        app.innerHTML = `
        <div class="top-bar">
          <button type="button" class="btn btn-secondary btn-back" id="btn-back-chapters">${backListLabel}</button>
          <h1>Zadania</h1>
        </div>
        <p class="sub" style="margin-bottom:0.35rem">${escapeHtml(level.title)}</p>
        ${crumb}
        <p class="panel-title" style="margin-top:0.65rem">${escapeHtml(sec.title)}</p>
        <div class="list-stack">${items}</div>
      `;

        document.getElementById("btn-back-chapters").onclick = () => {
          taskSectionId = null;
          taskAnswerVisible = false;
          taskFormulasVisible = false;
          taskSolutionVisible = false;
          render();
        };

        app.querySelectorAll("[data-task-i]").forEach((btn) => {
          btn.onclick = () => {
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

      const crumb = level.curriculum
        ? `<p class="curriculum-crumb">${escapeHtml(curriculumBreadcrumbTitles(level, taskCurriculumPath).join(" › "))}</p>`
        : "";

      let chaptersHtml = "";
      if (level.curriculum) {
        let kids = getCurriculumChildren(level, taskCurriculumPath);
        if (!kids) kids = [];
        if (taskCurriculumPath.length === 0) {
          kids = kids.filter((n) => !(n.id.endsWith("-import") && !hasNodeChildren(n)));
        }
        chaptersHtml = kids
          .map((node) => {
            const nTasks = countTasksOnCurriculumNode(level, node);
            if (hasNodeChildren(node)) {
              const nSub = (node.children || []).length;
              return `<button type="button" class="list-item" data-cnav="${escapeHtml(node.id)}">${escapeHtml(node.title)}<small>${nSub} pozycji · ${tasksLabel(nTasks)}</small></button>`;
            }
            return `<button type="button" class="list-item" data-leaf="${escapeHtml(node.id)}">${escapeHtml(node.title)}<small>${tasksLabel(nTasks)}</small></button>`;
          })
          .join("");
      } else {
        chaptersHtml = level.sections
          .map(
            (s) => `
        <button type="button" class="list-item" id="chap-${escapeHtml(s.id)}">
          ${escapeHtml(s.title)}
          <small>${tasksLabel(s.tasks.length)}</small>
        </button>`
          )
          .join("");
      }

      const panelTitle = level.curriculum ? "Plan programu" : "Działy";
      const backLabel = level.curriculum && taskCurriculumPath.length ? "← Wyżej" : "← Menu";
      const zadaniaMeta = `${tasksLabel(countTasksInLevel(level))} · ${chaptersLabel(countCurriculumTopNodes(level))}`;

      app.innerHTML = `
        <div class="top-bar">
          <button type="button" class="btn btn-secondary btn-back" id="btn-back-levels">${backLabel}</button>
          <h1>Zadania</h1>
        </div>
        <p class="sub" style="margin-bottom:0.5rem">${escapeHtml(level.title)}</p>
        <p class="sub" style="margin:0 0 0.75rem;font-size:0.85rem;color:var(--muted)">${escapeHtml(zadaniaMeta)}</p>
        ${crumb}
        <p class="panel-title" style="margin-top:0.75rem">${panelTitle}</p>
        <div class="list-stack">${chaptersHtml}</div>
      `;

      document.getElementById("btn-back-levels").onclick = () => {
        if (level.curriculum && taskCurriculumPath.length > 0) {
          taskCurriculumPath.pop();
          render();
        } else {
          screen = "main";
          mainTab = "fiszki";
          taskLevelId = null;
          taskCurriculumPath = [];
          render();
        }
      };

      app.querySelectorAll("[data-cnav]").forEach((btn) => {
        btn.onclick = () => {
          const id = btn.getAttribute("data-cnav");
          if (id) taskCurriculumPath.push(id);
          render();
        };
      });
      app.querySelectorAll("[data-leaf]").forEach((btn) => {
        btn.onclick = () => {
          const id = btn.getAttribute("data-leaf");
          if (!id) return;
          taskSectionId = id;
          taskIndex = 0;
          taskAnswerVisible = false;
          taskFormulasVisible = false;
          taskSolutionVisible = false;
          render();
        };
      });

      if (!level.curriculum) {
        level.sections.forEach((s) => {
          const b = document.getElementById("chap-" + s.id);
          if (b) {
            b.onclick = () => {
              taskSectionId = s.id;
              taskIndex = 0;
              taskAnswerVisible = false;
              taskFormulasVisible = false;
              taskSolutionVisible = false;
              render();
            };
          }
        });
      }
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
        taskQuizSolved = !taskNeedsQuizGate(t);
        taskAnswerVisible = false;
        taskFormulasVisible = false;
        taskSolutionVisible = false;
      }

      const needsQuizGate = taskNeedsQuizGate(t);
      const gateLocked = needsQuizGate && !taskQuizSolved;
      const fq = t.formulaQuiz;

      let formulaQuizHtml = "";
      if (needsQuizGate && fq) {
        const quizOptsClass = "quiz-options quiz-options--grid2 task-quiz-options";
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

      const gateAttr = gateLocked ? " disabled" : "";
      const gateCls = gateLocked ? " btn-gated" : "";

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
        taskQuizSolved && needsQuizGate && fq ? taskFormulaQuizLegendHaystack(t) : "";
      const quizLegendEntries = quizLegendHaystack ? getLegendEntriesMatchingHaystack(quizLegendHaystack) : [];
      const quizLegendHtml =
        taskQuizSolved && needsQuizGate && fq
          ? quizLegendEntries.length > 0
            ? `<div class="task-quiz-symbol-legend"><p class="answer-label">Legenda symboli (wzór z quizu)</p>${symbolLegendBlockHtml(
                quizLegendEntries
              )}</div>`
            : `<div class="task-quiz-symbol-legend"><p class="hint" style="margin:0">Brak dopasowanych symboli w bazie legendy dla tego wzoru.</p></div>`
          : "";

      const unlockAnimClass = taskQuizUnlockAnim ? " task-quiz-unlock-anim" : "";
      taskQuizUnlockAnim = false;

      app.innerHTML = `
        <div class="top-bar">
          <button type="button" class="btn btn-secondary btn-back" id="btn-back-list">← Lista</button>
          <h1>Zadanie</h1>
        </div>
        <p class="progress">${taskIndex + 1} / ${sec.tasks.length} · ${escapeHtml(level ? level.title : "")} · ${escapeHtml(sec.title)}</p>
        <div class="task-sheet${unlockAnimClass}">
          <span class="label">${escapeHtml(t.title)}</span>
          <div class="task-q">${richMixedLinesToHtml(t.question)}</div>
          ${formulaQuizHtml}
          <div class="task-actions">
            <button type="button" class="btn${taskFormulasVisible ? " btn-secondary" : ""}${gateCls}" id="btn-toggle-formulas"${gateAttr}>
              ${taskFormulasVisible ? "Ukryj wzory" : "Pokaż wzory"}
            </button>
            <button type="button" class="btn${taskAnswerVisible ? " btn-secondary" : ""}${gateCls}" id="btn-toggle-answer"${gateAttr}>
              ${taskAnswerVisible ? "Ukryj odpowiedź" : "Pokaż odpowiedź"}
            </button>
            <button type="button" class="btn${taskSolutionVisible ? " btn-secondary" : ""}${gateCls}" id="btn-toggle-solution"${gateAttr}>
              ${taskSolutionVisible ? "Ukryj pełne rozwiązanie" : "Pokaż pełne rozwiązanie (kroki)"}
            </button>
          </div>
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
          <button type="button" class="btn btn-secondary" id="btn-task-prev">Poprzednie</button>
          <button type="button" class="btn btn-secondary" id="btn-task-next">Następne</button>
        </div>
      `;

      queueMountKatex();
      requestAnimationFrame(() => {
        mountKatexIn(app);
      });

      if (needsQuizGate && fq) {
        app.querySelectorAll("[data-task-quiz-opt]").forEach((btn) => {
          btn.onclick = () => {
            if (taskQuizSolved) return;
            const i = Number(btn.getAttribute("data-task-quiz-opt"));
            if (Number.isNaN(i) || !fq.choices[i]) return;
            taskQuizPickIndex = i;
            if (fq.choices[i].correct) {
              taskQuizSolved = true;
              taskQuizUnlockAnim = true;
            }
            render();
          };
        });
      }

      document.getElementById("btn-back-list").onclick = () => {
        screen = "task-chapters";
        taskAnswerVisible = false;
        taskFormulasVisible = false;
        taskSolutionVisible = false;
        lastTaskQuizGateKey = "";
        render();
      };

      document.getElementById("btn-toggle-formulas").onclick = () => {
        if (gateLocked) return;
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
        if (taskIndex > 0) {
          taskIndex -= 1;
          taskAnswerVisible = false;
          taskFormulasVisible = false;
          taskSolutionVisible = false;
          render();
        }
      };

      document.getElementById("btn-task-next").onclick = () => {
        if (taskIndex < sec.tasks.length - 1) {
          taskIndex += 1;
          taskAnswerVisible = false;
          taskFormulasVisible = false;
          taskSolutionVisible = false;
          render();
        }
      };
      return;
    }

    console.warn("render: nieobsługiwany screen —", screen);
    screen = "main";
    mainTab = "fiszki";
    app.innerHTML = `<div class="app-boot-error"><p class="flash-complete-title">Nieznany stan widoku. Wracam do menu.</p><button type="button" class="btn" id="btn-recover-screen">OK</button></div>`;
    const br = document.getElementById("btn-recover-screen");
    if (br) br.onclick = () => render();
  }

  boot();
})();
