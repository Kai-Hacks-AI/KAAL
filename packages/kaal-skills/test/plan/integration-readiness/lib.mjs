// Helpers for the skills/C1 planned Cases. They read the repository and build throwaway subjects in a temp directory; nothing else.
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
export const PKG = resolve(HERE, '../../..');
export const ROOT = resolve(PKG, '../..');
export const EVIDENCE = join(PKG, 'plan/integration-readiness/evidence');
export const DRAFT = join(EVIDENCE, 'testing.integration.draft.json');
export const ARCH_DRAFT = join(EVIDENCE, 'architecture.activation.draft.json');
export const FIXTURES = join(EVIDENCE, 'testing.fixtures.mjs');
export const CONFORMS = join(PKG, 'test/lib/conforms.mjs');
export const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
export const draft = () => readJson(DRAFT);
export const archDraft = () => readJson(ARCH_DRAFT);

/** The common evaluator (DO). conforms({ declaration, root, fixtures }) -> { F1..F6: [{ status, mechanism, detail }] }; verdict(out) -> { F1..F6: 'PASS'|'FAIL'|'UNKNOWN' }; discover(root) -> [{ package, declaration, status? }]. */
export async function load() {
  assert.ok(existsSync(CONFORMS), 'missing: packages/kaal-skills/test/lib/conforms.mjs (the common evaluator, exporting conforms, verdict and discover)');
  const m = await import(pathToFileURL(CONFORMS).href);
  for (const f of ['conforms', 'verdict', 'discover']) assert.equal(typeof m[f], 'function', `conforms.mjs does not export ${f}`);
  return m;
}

/** Evaluate a declaration of the real Testing package at the repository root. */
export async function check(declaration, { root = ROOT, fixtures = FIXTURES } = {}) {
  const { conforms, verdict } = await load();
  const out = await conforms({ declaration, root, fixtures });
  return { out, v: verdict(out) };
}
export const passes = (out, req, mechanism) => out[req].some((x) => x.status === 'PASS' && x.mechanism === mechanism);

/** A throwaway subject package: ownership claim, one module, one fixtures module and a declaration. Returns { root, declaration, fixtures }. */
export function subject({ module, fixtures, mechanism, docs = 'Subject.md', docsText = '# Subject\n' }) {
  const root = mkdtempSync(join(tmpdir(), 'skills-subject-'));
  const pkg = join(root, 'packages/kaal-subject');
  mkdirSync(join(pkg, 'lib'), { recursive: true });
  const owner = { kind: 'capability', name: 'Subject', id: 'f'.repeat(64) };
  writeFileSync(join(pkg, 'ownership.kaal.json'), JSON.stringify({ owner, paths: ['packages/kaal-subject/'] }));
  writeFileSync(join(pkg, 'lib/mechanism.mjs'), module);
  writeFileSync(join(pkg, docs), docsText);
  const fixturesPath = join(root, 'fixtures.mjs');
  writeFileSync(fixturesPath, fixtures);
  const declaration = { owner, package: 'packages/kaal-subject', mechanisms: [{ name: 'm', level: 'script', kind: 'check', invoke: { module: 'lib/mechanism.mjs', export: 'm' }, docs, fixtures: 'm', ...mechanism }], judgment: [] };
  return { root, declaration, fixtures: fixturesPath };
}
export const OUTCOME = { at: 'result', clear: ['clear'], report: ['report'], unknown: ['unknown'] };
export const THREE = `export const m = { clear: { args: ['c'] }, report: { args: ['r'] }, unknown: { args: ['u'] } };\n`;

/** A throwaway subject whose mechanism is a command (node lib/tool.mjs <fixture args>), read by its exit status and its JSON output. */
export function commandSubject({ tool, fixtures, mechanism }) {
  const s = subject({ module: 'export {};\n', fixtures, mechanism: {} });
  const pkg = join(s.root, 'packages/kaal-subject');
  writeFileSync(join(pkg, 'lib/tool.mjs'), tool);
  s.declaration.mechanisms[0] = { name: 'm', level: 'script', kind: 'check', invoke: { command: ['node', 'lib/tool.mjs'] }, docs: 'Subject.md', fixtures: 'm', ...mechanism };
  return s;
}
export const EXIT_OUTCOME = { at: 'exit', clear: [0], report: [1], unknown: [2] };
export const HONEST_TOOL = `const k = process.argv[2];\nprocess.stdout.write(JSON.stringify({ why: 'because ' + k }));\nprocess.exit(k === 'c' ? 0 : k === 'r' ? 1 : 2);\n`;
