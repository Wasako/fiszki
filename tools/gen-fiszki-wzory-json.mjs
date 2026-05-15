/**
 * Generuje data/fiszki-wzory.json z:
 * - js/cards-wzory-cke.js (scope: cke — pełna karta maturalna, tylko rozszerzenie)
 * - js/cards-wzory-podstawowka.js (scope: podstawowka — SP i liceum podstawa)
 */
import { createRequire } from "module";
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function readBalancedArg(s, pos) {
  if (!s || pos >= s.length || s[pos] !== "{") return null;
  let d = 0;
  for (let k = pos; k < s.length; k++) {
    const ch = s[k];
    if (ch === "{") d++;
    else if (ch === "}") {
      d--;
      if (d === 0) return { inner: s.slice(pos + 1, k), end: k + 1 };
    }
  }
  return null;
}

function matchFirstFrac(tex) {
  for (const prefix of ["\\dfrac{", "\\tfrac{", "\\frac{"]) {
    const i = tex.indexOf(prefix);
    if (i === -1) continue;
    const pOpen = i + prefix.length - 1;
    const n1 = readBalancedArg(tex, pOpen);
    if (!n1 || n1.end >= tex.length || tex[n1.end] !== "{") continue;
    const n2 = readBalancedArg(tex, n1.end);
    if (!n2) continue;
    if (!String(n1.inner).trim() || !String(n2.inner).trim()) continue;
    return { i, prefix, n1, n2 };
  }
  return null;
}

function invertFirstFrac(tex) {
  const m = matchFirstFrac(tex);
  if (!m) return null;
  const rep = m.prefix + m.n2.inner + "}{" + m.n1.inner + "}";
  return tex.slice(0, m.i) + rep + tex.slice(m.n2.end);
}

function fracToImplicitProduct(tex) {
  const m = matchFirstFrac(tex);
  if (!m) return null;
  const prod = m.n1.inner + "\\," + m.n2.inner;
  return tex.slice(0, m.i) + prod + tex.slice(m.n2.end);
}

function hasMalformedFracInTex(tex) {
  const t = String(tex);
  if (/\\(?:d|t)?frac\{\s*\}/.test(t)) return true;
  if (/\\(?:d|t)?frac\{[^}]*\}\{\s*\}/.test(t)) return true;
  return false;
}

function swapEqSidesAtDepthZero(tex) {
  let depth = 0;
  for (let k = 0; k < tex.length; k++) {
    const ch = tex[k];
    if (ch === "{") depth++;
    else if (ch === "}") depth = Math.max(0, depth - 1);
    else if (ch === "=" && depth === 0) {
      const lhs = tex.slice(0, k).trim();
      const rhs = tex.slice(k + 1).trim();
      if (!lhs || !rhs) return null;
      return rhs + "=" + lhs;
    }
  }
  return null;
}

function isSameFormulaUpToEqSideSwap(a, b) {
  const na = String(a).replace(/\s+/g, " ").trim();
  const nb = String(b).replace(/\s+/g, " ").trim();
  if (na === nb) return true;
  const sw = swapEqSidesAtDepthZero(na);
  return sw === nb || swapEqSidesAtDepthZero(nb) === na;
}

function norm(s) {
  return String(s).replace(/\s+/g, " ").trim();
}

function splitLhsRhs(tex) {
  let depth = 0;
  for (let k = 0; k < tex.length; k++) {
    const ch = tex[k];
    if (ch === "{") depth++;
    else if (ch === "}") depth = Math.max(0, depth - 1);
    else if (ch === "=" && depth === 0) {
      const lhs = tex.slice(0, k).trim();
      const rhs = tex.slice(k + 1).trim();
      if (!lhs || !rhs) return null;
      return { lhs, rhs, rel: "=" };
    } else if ((ch === "\\le" || ch === "\\ge" || ch === "\\approx") && depth === 0) {
      const lhs = tex.slice(0, k).trim();
      const rhs = tex.slice(k + ch.length).trim();
      if (!lhs || !rhs) return null;
      return { lhs, rhs, rel: ch };
    }
  }
  return null;
}

function joinLhsRelRhs(sp, rhsOverride) {
  return sp.lhs + sp.rel + (rhsOverride != null ? rhsOverride : sp.rhs);
}

function collectSameLhsDistractors(correct) {
  const sp = splitLhsRhs(correct);
  if (!sp) return [];
  const out = [];
  const inv = invertFirstFrac(sp.rhs);
  if (inv && !isSameFormulaUpToEqSideSwap(joinLhsRelRhs(sp, inv), correct)) {
    out.push(joinLhsRelRhs(sp, inv));
  }
  const prod = fracToImplicitProduct(sp.rhs);
  if (prod && !isSameFormulaUpToEqSideSwap(joinLhsRelRhs(sp, prod), correct)) {
    out.push(joinLhsRelRhs(sp, prod));
  }
  const sw = swapEqSidesAtDepthZero(correct);
  if (sw && !isSameFormulaUpToEqSideSwap(sw, correct)) out.push(sw);
  return out.filter((d) => !hasMalformedFracInTex(d));
}

function padSameLhs(correct, existing) {
  const sp = splitLhsRhs(correct);
  const used = new Set(existing.map(norm));
  const out = existing.slice();
  let k = 0;
  while (out.length < 3) {
    k++;
    let w;
    if (sp) {
      w = joinLhsRelRhs(sp, sp.rhs + "\\quad\\text{(×" + k + ")}");
    } else {
      w = correct + "\\quad\\text{(×" + k + ")}";
    }
    if (!used.has(norm(w))) {
      used.add(norm(w));
      out.push(w);
    }
  }
  return out.slice(0, 3);
}

function symbolFromLhs(lhs) {
  if (!lhs) return "";
  const s = lhs.replace(/\s+/g, " ").trim();
  if (s.length <= 40) return s;
  return s.slice(0, 37) + "...";
}

function cardKey(topic, front) {
  return norm(topic) + "\x1e" + norm(front);
}

function buildCardRow(topic, name, correct_latex, scope, showSp) {
  const sp = splitLhsRhs(correct_latex);
  const symbol = sp ? symbolFromLhs(sp.lhs) : "";
  let distractors = collectSameLhsDistractors(correct_latex);
  distractors = padSameLhs(correct_latex, distractors);
  const row = {
    topic,
    name,
    symbol,
    correct_latex,
    distractors,
    scope,
  };
  if (scope === "podstawowka" && showSp === false) row.showSp = false;
  return row;
}

const require = createRequire(import.meta.url);
globalThis.window = globalThis;
require(join(root, "js", "cards-wzory-cke.js"));
require(join(root, "js", "cards-wzory-podstawowka.js"));

const ckeRaw = globalThis.window.__WZORY_CKE_CARDS__;
const podRaw = globalThis.window.__WZORY_PODSTAWOWKA_CARDS__;
if (!Array.isArray(ckeRaw)) throw new Error("Brak __WZORY_CKE_CARDS__");
if (!Array.isArray(podRaw)) throw new Error("Brak __WZORY_PODSTAWOWKA_CARDS__");

/** @type {Map<string, { topic: string, front: string, back: string }>} */
const ckeByKey = new Map();
for (const c of ckeRaw) {
  ckeByKey.set(cardKey(c.topic, c.front), c);
}

const cards = [];

for (const c of ckeRaw) {
  const topic = String(c.topic || "");
  const name = String(c.front || "");
  const correct_latex = String(c.back || "").trim();
  cards.push(buildCardRow(topic, name, correct_latex, "cke"));
}

let podAdded = 0;

for (const c of podRaw) {
  let topic = String(c.topic || "");
  let name = String(c.front || "");
  let correct_latex = String(c.back || "").trim();

  if (Array.isArray(c.ckeRef) && c.ckeRef.length >= 2) {
    const ref = ckeByKey.get(cardKey(c.ckeRef[0], c.ckeRef[1]));
    if (ref) {
      topic = String(ref.topic || topic);
      name = String(ref.front || name);
      correct_latex = String(ref.back || "").trim();
    } else {
      console.warn("Brak ckeRef:", c.ckeRef.join(" / "));
    }
  }

  if (!correct_latex) {
    console.warn("Pominięto (brak LaTeX):", topic, name);
    continue;
  }

  const showSp = c.showSp !== false;
  cards.push(buildCardRow(topic, name, correct_latex, "podstawowka", showSp));
  podAdded++;
}

const payload = {
  version: 2,
  source: "js/cards-wzory-cke.js + js/cards-wzory-podstawowka.js",
  cards,
};

const outPath = join(root, "data", "fiszki-wzory.json");
writeFileSync(outPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
console.log("Wrote", outPath, "| cke:", ckeRaw.length, "| podstawowka:", podAdded, "| razem:", cards.length);
