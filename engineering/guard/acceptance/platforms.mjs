// Platforms in Guard's tests (guard/C118). A case's applicability is declared in the Engineering Test Plan,
// engineering/guard/testing.md, never decided in the case: every case is registered on every host with the same
// title and body, and on a platform its row names it ends as not applicable, with the reason, before the body
// runs. guard/T132 audits every Guard test file against the same Test Plan, so an exception cannot hide a
// weakened assertion.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const PLAN = join(HERE, "..", "testing.md");
export const PLATFORMS = ["linux", "darwin", "win32"];

/** A platform reference in test code. */
export const REFERENCE = /process\.platform|\bWINDOWS\b|\bwindows\b|\bwin32\b|\bdarwin\b|os\.platform\(|\bplatform\(\)/;

/** The rows of the table between `<!-- begin -->` and `<!-- end -->` in `text`, each as its cells. */
export function rows(text, begin, end) {
  const at = text.indexOf(`<!-- ${begin}`);
  if (at < 0) return [];
  const stop = text.indexOf(`<!-- ${end} -->`, at);
  return text
    .slice(at, stop < 0 ? undefined : stop)
    .split("\n")
    .filter((l) => l.startsWith("| ") && !/^\| -/.test(l))
    .slice(1)
    .map((l) => l.split(" | ").map((c) => c.replace(/^\| |\s*\|$/g, "").trim()));
}

const plain = (cell) => cell.replace(/^`|`$/g, "");

/** The declared exceptions of the Engineering Test Plan: { case: { platforms, reason, evidence, review } }. */
export function declared(text) {
  return Object.fromEntries(
    rows(text, "applicability: Engineering-side cases", "end of applicability").map(([id, on, reason, evidence, review]) => [
      id,
      { platforms: (on ?? "").split(/,\s*/).filter(Boolean), reason: reason ?? "", evidence: evidence ?? "", review: review ?? "" },
    ]),
  );
}

/** The listed platform differences: [{ file, reference, difference, why }], and the raised ones: [{ file, reference, change }]. */
export function differences(text) {
  return {
    kept: rows(text, "platform differences", "end of platform differences").map(([file, reference, difference, why]) => ({ file: plain(file), reference: plain(reference), difference, why })),
    raised: rows(text, "raised platform differences", "end of raised platform differences").map(([file, reference, change]) => ({ file: plain(file), reference: plain(reference), change })),
  };
}

let plan;
/**
 * The `node:test` options for case `id` on this host: none where it applies, and where the Test Plan declares
 * it not applicable here, a skip that names the reason, before the body runs.
 */
export function applicability(id, platform = process.platform) {
  plan ??= declared(readFileSync(PLAN, "utf8"));
  const row = plan[id];
  return row?.platforms.includes(platform) ? { skip: `not applicable: ${row.reason}` } : {};
}

/**
 * Every finding in Guard's test `files` ({ path: text }) against the Engineering Test Plan (`engineering`) and the
 * package's Test Plan (`delivered`, its applicability table). An empty list means every exception is declared,
 * justified and reviewed, and every other platform reference is listed with why the assertion keeps its strength.
 */
export function audit({ files, engineering, delivered }) {
  const findings = [];
  const exceptions = declared(engineering);
  for (const [id, row] of Object.entries(exceptions)) {
    if (row.platforms.length === 0 || row.platforms.some((p) => !PLATFORMS.includes(p))) findings.push(`${id}: the declared platforms are not Node's names: ${row.platforms.join(", ")}`);
    if (PLATFORMS.every((p) => row.platforms.includes(p))) findings.push(`${id}: declared not applicable on every platform, so it never runs`);
    if (!row.reason) findings.push(`${id}: declared not applicable with no reason`);
    if (!/https:\/\//.test(row.evidence)) findings.push(`${id}: declared not applicable with no linked evidence`);
    if (!/https:\/\/github\.com\/\S+\/pull\/\d+#(pullrequestreview|issuecomment|discussion_r)-?\d+/.test(row.review)) findings.push(`${id}: declared not applicable with no linked Review judgment`);
  }
  const packaged = rows(delivered, "applicability:", "end of applicability").map(([name, on]) => ({ name: plain(name), platforms: on.split(/,\s*/) }));
  const { kept, raised } = differences(engineering);
  const listed = [...kept, ...raised.filter((r) => /guard\/C\d+/.test(r.change))];
  for (const r of raised.filter((r) => !/guard\/C\d+/.test(r.change))) findings.push(`${r.file}: a raised difference names no Change: ${r.reference}`);
  const used = new Set();
  for (const [path, text] of Object.entries(files)) {
    text.split("\n").forEach((line, n) => {
      if (!REFERENCE.test(line)) return;
      const at = `${path}:${n + 1}`;
      if (/\bt\.(skip|todo)\s*\(/.test(line)) return void findings.push(`${at}: a case skips or marks todo by platform: ${line.trim()}`);
      if (/\?\s*\(\)\s*=>\s*\{\s*\}|\?\s*(it|test|describe)\b|:\s*(it|test|describe)\s*\)|\bif\s*\(.*\)\s*(it|test|describe)\s*\(/.test(line)) return void findings.push(`${at}: a case is registered only on some platforms: ${line.trim()}`);
      const option = /^\s*(?:it|test)\(\s*"([^"]+)",\s*\{\s*skip:\s*process\.platform\s*===\s*"(\w+)"/.exec(line);
      if (option) {
        const [, title, platform] = option;
        const declaredHere = packaged.some((p) => p.name.endsWith(`> ${title}`) && p.platforms.length === 1 && p.platforms[0] === platform);
        if (!declaredHere) findings.push(`${at}: a skip by platform that the package's Test Plan does not declare for "${title}" on ${platform}`);
        return;
      }
      if (/\bt\.diagnostic\(/.test(line)) return;
      const hit = listed.find((d) => d.file === path && line.includes(d.reference));
      if (!hit) return void findings.push(`${at}: a platform reference no Test Plan row lists: ${line.trim()}`);
      used.add(hit);
    });
  }
  for (const d of listed) if (!used.has(d)) findings.push(`${d.file}: a listed platform difference matches no line: ${d.reference}`);
  return findings;
}
