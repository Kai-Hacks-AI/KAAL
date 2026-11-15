// Helpers for the testing/C61 planned Cases. Read-only: they read the repository and nothing else.
// The survey mechanic lives here: it validates declared links, identities and consistency, and decides nothing about adequacy.
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { PKG, readJson, readText, sha } from '../testability/lib.mjs';

export { PKG, readJson, readText, sha };
export const REPO = join(PKG, '../..');
export const PLAN = join(PKG, 'plan/case-ownership');
export const SURVEY = join(PLAN, 'survey');
export const STATUSES = ['owned', 'unresolved'];
export const VERDICTS = ['adequate', 'inadequate', 'unknown'];
export const OUTCOMES = ['missing-node', 'missing-link', 'existing-node-should-own', 'none-found'];
export const readSurvey = (name) => readJson(join(SURVEY, name));

const walk = (dir, keep, out = []) => {
  for (const n of readdirSync(dir).sort()) {
    if (n === 'node_modules' || n === '.git') continue;
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p, keep, out);
    else if (keep(p)) out.push(p);
  }
  return out;
};
const rel = (p) => relative(REPO, p).split('\\').join('/');
/** The capability that owns a node: the part of its id before the slash. */
export const ownerOf = (nodeId) => nodeId.split('/')[0];

/** Where each node id is defined in the scope's Markdown: frontmatter `id:`, a `# <id>` heading, or a bold `**<id>**` that opens a list item. */
export function definitions(scope) {
  const defs = {};
  const add = (id, file) => { (defs[id] ??= []).includes(file) || defs[id].push(file); };
  for (const dir of scope)
    for (const f of walk(join(REPO, dir), (p) => p.endsWith('.md'))) {
      const text = readFileSync(f, 'utf8');
      for (const m of text.matchAll(/^id:\s*([\w-]+\/[A-Z]+\d+)\s*$/gm)) add(m[1], rel(f));
      for (const m of text.matchAll(/^#+\s+([\w-]+\/[A-Z]+\d+)\b/gm)) add(m[1], rel(f));
      for (const m of text.matchAll(/^\s*[-*]\s+\*\*([\w-]+\/[A-Z]+\d+)\*\*/gm)) add(m[1], rel(f));
    }
  return defs;
}

/** The ids a Case file declares in `export const tests = [...]` (null when it declares none). */
export function declared(text) {
  const m = text.match(/^export const tests\s*=\s*\[([^\]]*)\]/m);
  if (!m) return null;
  return [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map((x) => x[1]);
}

/** The survey of every Case file under the scope: owned when every declared link resolves to exactly one node, else unresolved with its reason. Never rejected. */
export function survey(scope) {
  const defs = definitions(scope);
  const cases = [];
  for (const dir of scope)
    for (const f of walk(join(REPO, dir), (p) => /(^|\/)T\d+\.(test|red)\.mjs$/.test(p))) {
      const text = readFileSync(f, 'utf8');
      const ids = declared(text);
      const entry = { case: rel(f), fileSha256: sha(text), declared: ids ?? [] };
      const problems = [];
      if (!ids || ids.length === 0) problems.push('declares no link');
      for (const id of ids ?? []) {
        const at = defs[id] ?? [];
        if (at.length === 0) problems.push(`${id} is defined nowhere in the scope`);
        else if (at.length > 1) problems.push(`${id} is defined in ${at.length} places`);
      }
      if (problems.length) Object.assign(entry, { status: 'unresolved', reason: problems.join('; ') });
      else Object.assign(entry, { status: 'owned', nodes: ids.map((id) => ({ id, definedIn: defs[id][0] })) });
      cases.push(entry);
    }
  return cases.sort((a, b) => (a.case < b.case ? -1 : 1));
}

export function surveyOnDisk() {
  assert.ok(existsSync(join(SURVEY, 'survey.json')), 'missing: plan/case-ownership/survey/survey.json (the DO survey)');
  return readSurvey('survey.json');
}
export const capabilitiesOf = (cases) => new Set(cases.flatMap((c) => c.declared.map(ownerOf)));
