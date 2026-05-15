#!/usr/bin/env node
/**
 * Dla każdego liścia programu / sekcji z 0 zadań — dodaje sekcję (jeśli brak) i zadanie przykładowe.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

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

const CURRICULUM_LINKS_BY_LEVEL = {
  "lo-rozszerzenie": LO_RZ_CURRICULUM_LINKS,
  "lo-podstawa": LO_P_CURRICULUM_LINKS,
  sp: SP_CURRICULUM_LINKS,
};

const CURRICULUM_FILES = {
  "lo-rozszerzenie": "data/curriculum-lo-rozszerzenie.json",
  "lo-podstawa": "data/curriculum-lo-podstawa.json",
  sp: "data/curriculum-sp.json",
};

const SECTION_TITLES = {
  "lo1-wektory": "Wektory i wielkości skalarne",
  "lo1-ruch-jednostajny": "Ruch jednostajny prostoliniowy",
  "lo1-wielkosci-ruchu": "Wielkości opisujące ruch",
  "lo1-ruch-przyspieszony": "Ruch jednostajnie przyspieszony",
  "lo1-ruch-zmienny": "Spadek swobodny i rzut pionowy",
  "lo1-ruch-2d": "Rzuty w przestrzeni",
  "lo1-wzglednosc": "Względność ruchu",
  "lo1-newton": "Zasady dynamiki Newtona",
  "lo1-ped-impuls": "Pęd i popęd",
  "lo1-zach-pedu": "Zasada zachowania pędu",
  "lo1-tarcie": "Tarcie",
  "lo1-okrag-nieinercja": "Ruch po okręgu i układy nieinercjalne",
  "lo1-praca-moc-em": "Praca, moc, energia",
  "lo1-zee-zderzenia": "Energia i zderzenia",
  "lo1-hydrostatyka": "Hydrostatyka",
  "lo1-termodynamika-mini": "Termodynamika",
  "lo1-elektro-magnes": "Elektryczność i magnetyzm",
};

function hasChildren(n) {
  return Array.isArray(n.children) && n.children.length > 0;
}

function getLeafSectionRefs(node) {
  if (!node) return [];
  if (Array.isArray(node.sectionRefs) && node.sectionRefs.length) return [...node.sectionRefs];
  if (node.sectionRef) return [node.sectionRef];
  return [];
}

function findNode(nodes, id) {
  for (const n of nodes || []) {
    if (n.id === id) return n;
    if (n.children) {
      const f = findNode(n.children, id);
      if (f) return f;
    }
  }
  return null;
}

function walkLeaves(nodes, out) {
  for (const n of nodes || []) {
    if (hasChildren(n)) walkLeaves(n.children, out);
    else out.push(n);
  }
}

function applyStaticCurriculumLinks(level) {
  const links = CURRICULUM_LINKS_BY_LEVEL[level.id];
  if (!level.curriculum || !links) return;
  for (const leafId of Object.keys(links)) {
    const node = findNode(level.curriculum, leafId);
    if (node) node.sectionRefs = links[leafId].slice();
  }
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
      if (level.sections.some((s) => s.id === sid)) {
        const node = findNode(level.curriculum, leafId);
        if (node) {
          node.sectionRefs = node.sectionRefs || [];
          if (!node.sectionRefs.includes(sid)) node.sectionRefs.push(sid);
        }
      }
    }
  }
  if (level.id === "sp" && level.sections.some((s) => s.id === "praca-energia-sp")) {
    const node = findNode(level.curriculum, "sp-k7-pme-5");
    if (node) {
      node.sectionRefs = node.sectionRefs || [];
      if (!node.sectionRefs.includes("praca-energia-sp")) node.sectionRefs.push("praca-energia-sp");
    }
  }
}

function applyHeuristicCurriculumSectionRefs(level) {
  if (!level.curriculum || !Array.isArray(level.sections)) return;
  const known = new Set(level.sections.map((s) => s.id));

  function walk(nodes) {
    for (const node of nodes || []) {
      if (hasChildren(node)) {
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

function countTasksForRefs(level, refs) {
  const secs = new Map(level.sections.map((s) => [s.id, s]));
  let n = 0;
  for (const rid of refs) {
    const s = secs.get(rid);
    if (s && Array.isArray(s.tasks)) n += s.tasks.length;
  }
  return n;
}

function demoTask(sectionTitle, levelTitle, leafTitle) {
  const place = leafTitle && leafTitle !== sectionTitle ? `**${leafTitle}**` : `**${sectionTitle}**`;
  return {
    title: "Zadanie przykładowe",
    question: `${place} — ${levelTitle}. Tu dodasz właściwe zadania; na razie wpis pomocniczy dla nauczyciela.`,
    answer: "—",
  };
}

function ensureSection(level, sectionId, title) {
  let sec = level.sections.find((s) => s.id === sectionId);
  if (!sec) {
    sec = { id: sectionId, title: title || sectionId, tasks: [] };
    level.sections.push(sec);
    return { sec, created: true };
  }
  if (!Array.isArray(sec.tasks)) sec.tasks = [];
  return { sec, created: false };
}

function ensureDemoInSection(sec, levelTitle, leafTitle) {
  if (sec.tasks.length > 0) return false;
  sec.tasks.push(demoTask(sec.title, levelTitle, leafTitle));
  return true;
}

const zadaniaPath = path.join(root, "zadania.json");
const zadania = JSON.parse(fs.readFileSync(zadaniaPath, "utf8"));
const levels = zadania.levels;
let addedTasks = 0;
let createdSections = 0;
let linkedLeaves = 0;
const curriculumWrites = [];

for (const level of levels) {
  level.sections = level.sections || [];
  const curPath = path.join(root, CURRICULUM_FILES[level.id]);
  const curData = JSON.parse(fs.readFileSync(curPath, "utf8"));
  const ctx = { id: level.id, title: level.title, sections: level.sections, curriculum: curData.curriculum };

  applyStaticCurriculumLinks(ctx);
  augmentGeminiCurriculumRefs(ctx);
  applyHeuristicCurriculumSectionRefs(ctx);

  const leaves = [];
  walkLeaves(ctx.curriculum, leaves);
  let curDirty = false;

  for (const leaf of leaves) {
    const leafId = String(leaf.id || "");
    if (!leafId || leafId.endsWith("-import") || leafId.startsWith("imp-")) continue;

    const refs = getLeafSectionRefs(leaf);
    if (countTasksForRefs(ctx, refs) > 0) continue;

    if (!refs.length) {
      const title = String(leaf.title || leafId).trim();
      const { sec, created } = ensureSection(level, leafId, title);
      if (created) createdSections++;
      if (ensureDemoInSection(sec, level.title, title)) addedTasks++;
      leaf.sectionRefs = [leafId];
      curDirty = true;
      linkedLeaves++;
      continue;
    }

    for (const sid of refs) {
      const title =
        SECTION_TITLES[sid] ||
        level.sections.find((s) => s.id === sid)?.title ||
        String(leaf.title || sid).trim();
      const { sec, created } = ensureSection(level, sid, title);
      if (created) createdSections++;
      if (ensureDemoInSection(sec, level.title, String(leaf.title || "").trim())) addedTasks++;
    }
  }

  if (curDirty) curriculumWrites.push({ curPath, curData });
}

fs.writeFileSync(zadaniaPath, JSON.stringify({ levels }, null, 2) + "\n", "utf8");
for (const { curPath, curData } of curriculumWrites) {
  fs.writeFileSync(curPath, JSON.stringify(curData, null, 2) + "\n", "utf8");
}

console.log("Utworzono sekcji:", createdSections);
console.log("Dodano zadan przykladowych:", addedTasks);
console.log("Nowe sectionRefs w planie (liscie lo-rz):", linkedLeaves);
console.log("Zaktualizowano pliki planu:", curriculumWrites.length);
