# C80 interface

Drafts of the files the DO places under `engineering/testing/`, following `packages/kaal-engineering/skills/kaal-engineering/references/package-layout.json`. Each draft matches its placed file after the DO.

## Draft of I48.md

`````
---
id: testing/I48
title: every Case is well formed and explicitly attributed
---
# testing/I48 every Case is well formed and explicitly attributed

Contract: every Case file (`T<n>.test.mjs` or `T<n>.red.mjs`) carries a valid scoped `id`, a non-empty `tests` list pointing to real subjects, an exported `run` function, no duplicate `id`, and no stale line-1 header contradicting its exports, so that backward-link discovery and control evidence readers read the same truth everywhere. Whether a Case's assertions are strong, non-tautological, or sufficient is not decided here; that stays with Testing review and the Owner. Reason: an unattributed Case, a broken target id, or a stale header makes derived Suites and control evidence silently drop or misattribute verification. Owner: testing.
`````

## Draft of F173.md

`````
---
id: testing/F173
title: verify-case
kind: functional
serves: [testing/I48]
---
# testing/F173 verify-case

A pure judge over parsed Case files and the tree's known subject ids decides whether every Case in scope is well formed and explicitly attributed. It parses only top-level `export const id`, `export const tests`, and `export [async] function run` declarations (never fooled by template strings inside helper code), accepting both single and double quotes. It says FAIL naming each file and rule for: `missing-id`, `invalid-id` (not `<capability>/T<n>`), `unattributed-case` (missing or empty `tests`), `unknown-subject` (a target in `tests` absent from `knownIds` when supplied), `stale-header` (line 1 `// Case <id> tests: ...` disagrees with exported `id` or `tests`), `duplicate-id` (two files export the same `id`), and `missing-run`. It says UNKNOWN, which never passes, when the input cannot be read; FAIL outranks UNKNOWN. It says PASS with `applies: false` when no Case is in scope, and PASS with `applies: true` when every Case in scope is well formed. It reads nothing from Git history or pull request titles, and judges nothing about assertion strength or sufficiency.
`````

## Draft of A59.md

`````
---
id: testing/A59
title: judge-verify-case
addresses: [testing/F173]
---
# testing/A59 judge-verify-case

The component is `engineering/testing/13-source/scripts/judge-verify-case.mjs`: a zero-dependency Node ESM module exporting `parseCase(text)`, `judgeVerifyCase({ cases, knownIds })`, and a command line (`--root <dir> [--cases <comma-separated paths>]`) that exits `0` for PASS, `1` for FAIL, and `2` for UNKNOWN.

`parseCase(text)` reads only line-anchored top-level exports (`^export const id = ...`, `^export const tests = [...]`, `^export (async )?function run` or `^export const run =`) and line 1's optional `// Case <id> tests: <targets>` comment, normalizing CRLF/LF. `judgeVerifyCase` is pure over `{ cases: [{ path, text }], knownIds?: string[] | Set<string> }` and returns `{ verdict: 'PASS' | 'FAIL' | 'UNKNOWN', applies, message, findings }`, where `applies` is `false` only on a `PASS` with zero Cases in scope. The CLI walks `--root` (or reads only `--cases` when given), collects frontmatter `id:` values from `.md` files as `knownIds`, and hands them to `judgeVerifyCase`. Wiring into pre-push githooks and CI workflows is deferred to subsequent Changes.
`````

## Draft of CTL1.md

`````
---
id: testing/CTL1
title: verify Case
description: It reveals any Case file that is malformed, unattributed, duplicated, missing run, or carrying a stale header.
type: detective
status: designed
has: [testing/I48]
evidence: [fixture:2, real:1, provoked:1:fail]
---
# testing/CTL1 verify Case

A detective control that is meant to become preventive. `verify Case` inspects Case files (`T<n>.test.mjs` and `T<n>.red.mjs`) in a tree and reveals any Case that lacks a valid scoped `id`, has missing or empty `tests`, points to an unknown subject id, lacks an exported `run`, duplicates another Case's `id`, or carries a line-1 `// Case ... tests: ...` header that contradicts its exports. It says PASS with `applies: false` when no Case is in scope, PASS with `applies: true` when every Case in scope is well formed, FAIL naming each file and rule otherwise, and UNKNOWN (which never passes once required) when inputs cannot be read.

It checks form and attribution only: it does not say whether a Case is strong, whether a subject has enough Cases (`demand Cases`), whether a test was weakened (`limit Test-Drift`), or whether a Case ran (`observe Cases`). It has one Intent, `testing/I48`, which holds the details with `testing/F173` and `testing/A59`. It rolls out detective first: (1) observed locally and via pre-push githook feedback without blocking; (2) run as an advisory CI check behind a feature flag while collecting `[fixture:2, real:1, provoked:1:fail]` evidence; (3) promoted to preventive only after validation and the Owner's explicit authorization.
`````

## Draft of judge-verify-case.mjs

`````
#!/usr/bin/env node
// verify Case: is every Case file well formed and explicitly attributed? Pure over tree facts; never reads Git history or judges assertion sufficiency.
// judgeVerifyCase({ cases, knownIds }) -> { verdict: 'PASS' | 'FAIL' | 'UNKNOWN', applies, message, findings }
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCOPED_CASE_ID = /^[a-z][a-z0-9-]*\/T\d+$/;
const CASE_FILE = /(^|\/)T\d+\.(red|test)\.mjs$/;
const HEADER_RE = /^\/\/ Case (\S+) tests: (.*)$/;
const ID_RE = /^export const id\s*=\s*(['"])([^'"\r\n]+)\1\s*;?\s*$/m;
const TESTS_RE = /^export const tests\s*=\s*\[([^\]]*)\]\s*;?\s*$/m;
const RUN_RE = /^export\s+(?:async\s+)?function\s+run\s*\(|^export\s+const\s+run\s*=/m;
const FRONTMATTER_ID_RE = /^---\n([\s\S]*?)\n---/;

const slash = (p) => p.split(sep).join('/');

function parseList(raw) {
  const items = [];
  for (const part of raw.split(',')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const m = /^(['"])([^'"\r\n]+)\1$/.exec(trimmed);
    if (!m) return null;
    items.push(m[2]);
  }
  return items;
}

/** Parses top-level Case exports and optional line-1 header without being fooled by indented template strings. */
export function parseCase(text) {
  const normalized = text.replace(/\r\n/g, '\n');
  const firstLine = normalized.split('\n')[0] ?? '';
  const headerMatch = HEADER_RE.exec(firstLine);
  const header = headerMatch
    ? { id: headerMatch[1], tests: headerMatch[2].split(',').map((s) => s.trim()).filter(Boolean) }
    : null;
  const idMatch = ID_RE.exec(normalized);
  const testsMatch = TESTS_RE.exec(normalized);
  const tests = testsMatch ? parseList(testsMatch[1]) : null;
  const hasRun = RUN_RE.test(normalized);
  return { id: idMatch ? idMatch[2] : null, tests, hasRun, header };
}

function sameSet(a, b) {
  const sa = [...new Set(a)].sort();
  const sb = [...new Set(b)].sort();
  return sa.length === sb.length && sa.every((v, i) => v === sb[i]);
}

/** Pure judge over { cases: [{ path, text }], knownIds?: Iterable<string> }. */
export function judgeVerifyCase(input) {
  if (!input || typeof input !== 'object' || !Array.isArray(input.cases)) {
    return { verdict: 'UNKNOWN', applies: true, message: 'cannot judge: cases list is missing or invalid', findings: [] };
  }
  const known = input.knownIds === undefined ? null : new Set(input.knownIds);
  const findings = [];
  const unknownItems = [];
  const seenIds = new Map();

  for (const entry of input.cases) {
    if (!entry || typeof entry.path !== 'string' || entry.path === '' || typeof entry.text !== 'string') {
      unknownItems.push(entry?.path || '(unreadable case entry)');
      continue;
    }
    const { path, text } = entry;
    const parsed = parseCase(text);
    const rules = [];

    if (!parsed.id) rules.push('missing-id');
    else if (!SCOPED_CASE_ID.test(parsed.id)) rules.push('invalid-id');
    else {
      if (seenIds.has(parsed.id)) rules.push('duplicate-id');
      else seenIds.set(parsed.id, path);
    }

    if (!Array.isArray(parsed.tests) || parsed.tests.length === 0) {
      rules.push('unattributed-case');
    } else if (known) {
      const missing = parsed.tests.filter((t) => !known.has(t));
      if (missing.length) rules.push(`unknown-subject(${missing.join(',')})`);
    }

    if (!parsed.hasRun) rules.push('missing-run');

    if (parsed.header && parsed.id && Array.isArray(parsed.tests)) {
      if (parsed.header.id !== parsed.id || !sameSet(parsed.header.tests, parsed.tests)) {
        rules.push('stale-header');
      }
    }

    if (rules.length) findings.push({ path, id: parsed.id, rules });
  }

  if (findings.length) {
    const summary = findings.map((f) => `${f.path} (${f.rules.join(', ')})`).join('; ');
    return { verdict: 'FAIL', applies: true, message: `case form: ${summary}`, findings };
  }
  if (unknownItems.length) {
    return { verdict: 'UNKNOWN', applies: true, message: `cannot judge: unreadable case input (${unknownItems.join(', ')})`, findings: [] };
  }
  if (input.cases.length === 0) {
    return { verdict: 'PASS', applies: false, message: 'no Case in scope to verify', findings: [] };
  }
  return { verdict: 'PASS', applies: true, message: `all ${input.cases.length} Case(s) well formed and attributed`, findings: [] };
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function collectKnownIds(root) {
  const ids = new Set();
  for (const file of walk(root)) {
    if (!file.endsWith('.md')) continue;
    const text = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
    const fm = FRONTMATTER_ID_RE.exec(text);
    if (!fm) continue;
    for (const line of fm[1].split('\n')) {
      const m = /^id:\s*(\S+)\s*$/.exec(line.trim());
      if (m) ids.add(m[1]);
    }
  }
  return ids;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (isMain) {
  const arg = (k) => { const i = process.argv.indexOf(k); return i < 0 ? undefined : process.argv[i + 1]; };
  let r;
  try {
    const rootArg = arg('--root');
    if (!rootArg || !existsSync(rootArg) || !statSync(rootArg).isDirectory()) throw new Error('--root must be an existing directory');
    const root = resolve(rootArg);
    const explicit = arg('--cases');
    const caseFiles = explicit
      ? explicit.split(',').filter(Boolean).map((p) => resolve(root, p))
      : walk(root).filter((f) => CASE_FILE.test(slash(relative(root, f))));
    const cases = caseFiles.map((f) => ({ path: slash(relative(root, f)), text: readFileSync(f, 'utf8') }));
    const knownIds = collectKnownIds(root);
    r = judgeVerifyCase({ cases, knownIds });
  } catch (e) {
    r = { verdict: 'UNKNOWN', applies: true, message: `cannot judge: ${String(e.message)}`, findings: [] };
  }
  console.log(`${r.verdict}: ${r.message}`);
  process.exit({ PASS: 0, FAIL: 1, UNKNOWN: 2 }[r.verdict]);
}
`````
