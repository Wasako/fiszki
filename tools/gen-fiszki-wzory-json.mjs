/**
 * Generuje data/fiszki-wzory.json z js/cards-wzory-cke.js.
 * Dystraktory: ta sama lewa strona (LHS) i pierwszy operator relacji co w poprawnym wzorze.
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
  const swA = swapEqSidesAtDepthZero(na);
  if (swA != null && swA.replace(/\s+/g, " ").trim() === nb) return true;
  const swB = swapEqSidesAtDepthZero(nb);
  if (swB != null && swB.replace(/\s+/g, " ").trim() === na) return true;
  return false;
}

function stripVecNotation(tex) {
  const t = tex.replace(/\\vec\{([^{}]+)\}/g, "$1");
  return t === tex ? null : t;
}

function onceReplace(tex, from, to) {
  const i = tex.indexOf(from);
  if (i === -1) return null;
  return tex.slice(0, i) + to + tex.slice(i + from.length);
}

const QUIZ_FALLBACK_DISTRACTORS = [
  String.raw`\omega = \dfrac{v}{t}`,
  String.raw`v = \omega \cdot t`,
  String.raw`a = \dfrac{v}{t}`,
  String.raw`a = \dfrac{s}{t}`,
  String.raw`F = m \cdot t`,
  String.raw`F = \dfrac{m}{v}`,
  String.raw`p = \dfrac{m}{t}`,
  String.raw`E_{\mathrm{kin}} = m v^{2}`,
  String.raw`P = U \cdot R`,
  String.raw`U = I + R`,
  String.raw`T = \dfrac{2\pi}{v}`,
  String.raw`\varepsilon = \dfrac{\omega}{t^{2}}`,
  String.raw`v = \dfrac{s}{t^{2}}`,
  String.raw`Q = I \cdot R`,
];

function collectWrongTexCandidates(correct) {
  const c = String(correct).trim();
  const out = [];
  const add = (x) => {
    if (x == null) return;
    const t = String(x).trim();
    if (!t || t === c) return;
    if (hasMalformedFracInTex(t)) return;
    if (isSameFormulaUpToEqSideSwap(t, c)) return;
    if (out.some((u) => u.replace(/\s+/g, " ") === t.replace(/\s+/g, " "))) return;
    out.push(t);
  };
  add(invertFirstFrac(c));
  add(fracToImplicitProduct(c));
  add(stripVecNotation(c));
  add(onceReplace(c, "\\cdot", "/"));
  add(onceReplace(c, "/", "\\cdot"));
  add(onceReplace(c, "\\,", "\\cdot"));
  add(c.replace(/\\Delta/g, ""));
  add(c.replace(/\+/g, "-"));
  add(c.replace(/-/g, "+"));
  const inv = invertFirstFrac(c);
  if (inv) add(invertFirstFrac(inv));
  add(onceReplace(c, "\\dfrac", "\\tfrac"));
  add(c.replace(/\^2/g, "^3"));
  for (const d of QUIZ_FALLBACK_DISTRACTORS) add(d);
  return out;
}

function splitLhsRhs(tex) {
  const t = String(tex || "").trim();
  const relMarkers = ["=", "\\le", "\\ge", "\\approx"];
  let cut = -1;
  let relStr = "";
  let relLen = 0;
  let depth = 0;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === "{") depth++;
    else if (c === "}") depth = Math.max(0, depth - 1);
    if (depth !== 0) continue;
    for (const m of relMarkers) {
      if (t.startsWith(m, i)) {
        cut = i;
        relStr = m;
        relLen = m.length;
        break;
      }
    }
    if (cut >= 0) break;
  }
  if (cut <= 0) return null;
  return {
    lhs: t.slice(0, cut).trim(),
    rel: relStr,
    relLen,
    rhs: t.slice(cut + relLen).trim(),
  };
}

function norm(x) {
  return String(x).replace(/\s+/g, " ").trim();
}

function isUglyDistractor(tex) {
  const t = String(tex);
  if (/\\cdot,/.test(t)) return true;
  if (/\\cdott/.test(t)) return true;
  if (/\\cdot\\quad/.test(t) && /,,/.test(t)) return true;
  if (/\\dfrac\{2\}\{1\}/.test(t)) return true;
  if (/1\\,2\s*a/.test(t)) return true;
  return false;
}

function joinLhsRelRhs(sp, rhs) {
  const gap = sp.rel === "=" ? " = " : " " + sp.rel + " ";
  return sp.lhs + gap + rhs;
}

function rhsOnlyMutations(rhs) {
  const out = [];
  const add = (x) => {
    if (x == null) return;
    const t = String(x).trim();
    if (!t || norm(t) === norm(rhs)) return;
    if (hasMalformedFracInTex(t)) return;
    if (out.some((u) => norm(u) === norm(t))) return;
    out.push(t);
  };
  add(invertFirstFrac(rhs));
  add(fracToImplicitProduct(rhs));
  add(onceReplace(rhs, "\\cdot", "/"));
  add(onceReplace(rhs, "\\dfrac", "\\tfrac"));
  add(rhs.replace(/\^2/g, "^3"));
  add(onceReplace(rhs, "+", "-"));
  if (!rhs.includes("=") && rhs.length > 0 && rhs.length < 72) {
    add(rhs + "^2");
    add("2\\," + rhs);
    add("\\dfrac{" + rhs + "}{2}");
    add("\\dfrac{2}{" + rhs + "}");
  }
  return out;
}

function collectSameLhsDistractors(correct) {
  const sp = splitLhsRhs(correct);
  if (!sp) return [];
  const pool = collectWrongTexCandidates(correct);
  const out = [];
  for (const w of pool) {
    const sw = splitLhsRhs(w);
    if (!sw) continue;
    if (norm(sw.lhs) !== norm(sp.lhs) || sw.rel !== sp.rel) continue;
    if (norm(w) === norm(correct)) continue;
    if (isSameFormulaUpToEqSideSwap(w, correct)) continue;
    if (hasMalformedFracInTex(w)) continue;
    if (isUglyDistractor(w)) continue;
    out.push(w);
  }
  for (const rhsAlt of rhsOnlyMutations(sp.rhs)) {
    const w = joinLhsRelRhs(sp, rhsAlt);
    if (norm(w) === norm(correct)) continue;
    if (isSameFormulaUpToEqSideSwap(w, correct)) continue;
    if (hasMalformedFracInTex(w)) continue;
    if (isUglyDistractor(w)) continue;
    if (out.some((u) => norm(u) === norm(w))) continue;
    out.push(w);
  }
  return out;
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

const require = createRequire(import.meta.url);
globalThis.window = globalThis;
require(join(root, "js", "cards-wzory-cke.js"));
const raw = globalThis.window.__WZORY_CKE_CARDS__;
if (!Array.isArray(raw)) throw new Error("Brak __WZORY_CKE_CARDS__");

const cards = [];
for (const c of raw) {
  const correct_latex = String(c.back || "").trim();
  const sp = splitLhsRhs(correct_latex);
  const symbol = sp ? symbolFromLhs(sp.lhs) : "";
  let distractors = collectSameLhsDistractors(correct_latex);
  distractors = padSameLhs(correct_latex, distractors);

  cards.push({
    topic: c.topic,
    name: c.front,
    symbol,
    correct_latex,
    distractors,
  });
}

const payload = {
  version: 1,
  source: "js/cards-wzory-cke.js",
  cards,
};

const outPath = join(root, "data", "fiszki-wzory.json");
writeFileSync(outPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
console.log("Wrote", outPath, "cards:", cards.length);
