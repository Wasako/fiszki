/**
 * GitHub Actions: blokuje push edytorów z listy poza allowedPaths.
 * Wyłączenie: config/cms-access.json → "enabled": false
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const POLICY_PATH = "config/cms-access.json";

function loadPolicy() {
  if (!existsSync(POLICY_PATH)) {
    console.log(`Brak ${POLICY_PATH} — strażnik wyłączony.`);
    return null;
  }
  return JSON.parse(readFileSync(POLICY_PATH, "utf8"));
}

function pathAllowed(file, allowedPaths) {
  const f = String(file).replace(/\\/g, "/");
  return allowedPaths.some((raw) => {
    const p = String(raw).replace(/\\/g, "/");
    if (p.endsWith("/")) return f === p.slice(0, -1) || f.startsWith(p);
    return f === p;
  });
}

function changedFiles() {
  try {
    return execSync("git diff --name-only HEAD~1 HEAD", { encoding: "utf8" })
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  } catch {
    return execSync("git show --name-only --pretty=format:", { encoding: "utf8" })
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }
}

const policy = loadPolicy();
if (!policy || policy.enabled === false) {
  console.log("CMS limited editor guard: wyłączony.");
  process.exit(0);
}

const emails = (policy.limitedEditorEmails || []).map((e) =>
  String(e).trim().toLowerCase()
);
const allowedPaths = policy.allowedPaths || ["zadania.json", "admin/zadania/"];

let authorEmail = "";
try {
  authorEmail = execSync("git log -1 --format=%ae", { encoding: "utf8" }).trim().toLowerCase();
} catch {
  console.log("Nie można odczytać autora commita — pomijam.");
  process.exit(0);
}

if (!emails.includes(authorEmail)) {
  console.log(`Autor ${authorEmail} nie jest na liście ograniczonych edytorów — OK.`);
  process.exit(0);
}

const changed = changedFiles();
const forbidden = changed.filter((f) => !pathAllowed(f, allowedPaths));

if (forbidden.length) {
  console.error(
    `::error::Edytor ${authorEmail} może zmieniać tylko: ${allowedPaths.join(", ")}. Zabronione: ${forbidden.join(", ")}`
  );
  process.exit(1);
}

console.log(`OK — edytor ${authorEmail}, dozwolone zmiany (${changed.length} plików).`);
