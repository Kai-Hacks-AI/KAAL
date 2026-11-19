// Runs Case files with `node --test` and reports what was observed: GREEN, RED and UNKNOWN counts and each test's result (testing/C63).
// It observes and reports. It never judges a Change (kaal-change) and never enforces (Guard).
import { executeSync, initialize, isolatedEnvironment, kind, readFile, scratch } from '@kaihacksai/kaal-hosting';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SCHEMA = 'kaal-testing/run-report@1';
export const DEFAULT_TIMEOUT_MS = 300000;
const REPORTER = join(dirname(fileURLToPath(import.meta.url)), 'run-reporter.mjs');
const slash = (p) => p.split(sep).join('/');

/**
 * Turns one file's reporter events into tests and problems. Node reports a test when it ends, so children come before their parent:
 * the events of nesting n+1 directly before an event of nesting n are its children. Pure.
 * Returns `silent: true` when there was no event at all, which only the caller (who knows the exit status) can read.
 */
export function reconstruct(events, file) {
  const problems = [];
  const nodes = [];
  let pending = [];
  const unrecognised = (detail) => problems.push({ file, kind: 'unrecognised-output', detail });
  for (const [index, e] of events.entries()) {
    const node = { ...e, index };
    if (pending.some((p) => p.nesting > e.nesting + 1)) unrecognised(`nesting jumps before "${e.name}"`);
    node.children = pending.filter((p) => p.nesting === e.nesting + 1);
    pending = pending.filter((p) => p.nesting !== e.nesting + 1);
    pending.push(node);
    nodes.push(node);
  }
  if (pending.some((p) => p.nesting !== 0)) unrecognised('an event has no parent');

  // The file's own result: the last event, at nesting 0, line 1 column 1, named after the file, with no tests under it.
  const last = nodes.at(-1);
  const fileResult = last && last.nesting === 0 && last.kind === 'test' && last.line === 1 && last.column === 1 && last.children.length === 0 && (last.name === file || last.name === basename(file)) ? last : null;

  const tests = [];
  const visit = (node, path) => {
    for (const child of node.children) visit(child, [...path, node.name]);
    if (node === fileResult) return;
    const parent = node.children.length > 0;
    const ownFailure = node.type === 'fail' && node.failureType !== 'subtestsFailed';
    if (node.kind === 'suite') {
      if (ownFailure) problems.push({ file, kind: 'suite-failure', detail: `${[...path, node.name].join(' > ')}: ${node.failureType}` });
      return;
    }
    if (parent && !ownFailure) return; // a passing parent, or one that failed only because a child did
    let actual;
    let reason;
    if (node.skip || node.todo) { actual = 'UNKNOWN'; reason = node.skip ? 'skipped' : 'todo'; } // before pass or fail
    else if (node.type === 'pass') actual = 'GREEN';
    else if (node.code === 'ERR_ASSERTION') actual = 'RED';
    else {
      actual = 'UNKNOWN';
      reason = node.failureType === 'testTimeoutFailure' ? 'timeout' : node.failureType === 'cancelledByParent' ? 'cancelled' : 'error';
    }
    tests.push({ file, path, name: node.name, role: parent ? 'parent' : 'leaf', actual, ...(reason ? { reason } : {}), ...(node.message && actual !== 'GREEN' ? { detail: node.message } : {}), order: node.index });
  };
  for (const root of nodes.filter((n) => n.nesting === 0)) visit(root, []);

  if (nodes.some((n) => n.failureType === 'cancelledByParent')) problems.push({ file, kind: 'cancelled', detail: 'a test was cancelled, so tests after it may not have run' });
  if (fileResult?.type === 'fail') problems.push({ file, kind: fileResult.failureType === 'testTimeoutFailure' ? 'timeout' : 'file-failed', detail: `${fileResult.failureType ?? 'failed'}: ${fileResult.message ?? ''}`.trim() });
  else if (nodes.length > 0 && tests.length === 0 && problems.length === 0) problems.push({ file, kind: 'empty-inventory', detail: 'the file has no test' });
  return { tests, problems, silent: nodes.length === 0 };
}

// A Case reference: a leading `ns/T<n>` or a bare `T<n>`, followed by anything but a letter or digit.
const FORM = /^(?:([a-z][a-z0-9-]*)\/)?T(\d+)(?![A-Za-z0-9])/;
const formOf = (name) => {
  const m = FORM.exec(name);
  return m ? { namespace: m[1] ?? null, number: Number(m[2]), raw: m[0] } : null;
};
const sameForm = (a, b) => a.namespace === b.namespace && a.number === b.number;

/** Ids, ordinals, duplicate-name diagnostics and Case attribution for one file's tests. */
function identify(file, { tests, problems }, diagnostics) {
  const seen = new Map();
  const out = [];
  for (const t of [...tests].sort((a, b) => a.order - b.order)) {
    const base = [file, ...t.path, t.name].join(' > ');
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    const id = n > 1 ? `${base} #${n}` : base;
    const own = formOf(t.name);
    let inherited = null;
    for (let i = t.path.length - 1; i >= 0 && !inherited; i -= 1) inherited = formOf(t.path[i]);
    let found = own ?? inherited;
    if (own && inherited && !sameForm(own, inherited)) {
      diagnostics.push({ kind: 'conflicting-case-reference', file, id, references: [own.raw, inherited.raw] });
      found = null;
    }
    const { order, ...rest } = t;
    out.push({ id, ...rest, case: found });
  }
  for (const [base, n] of seen) if (n > 1) diagnostics.push({ kind: 'duplicate-name', file, ids: [base, ...Array.from({ length: n - 1 }, (_, i) => `${base} #${i + 2}`)] });
  return { tests: out, problems };
}

/**
 * Runs each file in its own `node --test` child, bounded by `timeoutMs` for the whole file (Hosting's timeout ends the child from outside,
 * which a per-test timeout cannot do for a test that blocks the event loop). Rejects invalid input; otherwise always returns a report.
 */
export async function runCases({ files, root, timeoutMs = DEFAULT_TIMEOUT_MS, streamsDir } = {}) {
  if (!Array.isArray(files) || files.length === 0) throw new Error('invalid input: files must be a nonempty list');
  if (typeof root !== 'string' || !isAbsolute(root)) throw new Error('invalid input: root must be an absolute path');
  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) throw new Error('invalid input: timeoutMs must be a positive integer');
  const relativeFiles = [];
  for (const f of files) {
    if (typeof f !== 'string' || f === '') throw new Error('invalid input: a file is not a path');
    const absolute = resolve(root, f);
    const rel = relative(root, absolute);
    if (rel.startsWith('..') || isAbsolute(rel)) throw new Error(`invalid input: ${f} lies outside root`);
    if ((await kind(absolute)) !== 'file') throw new Error(`invalid input: ${f} is not a file`);
    relativeFiles.push(slash(rel));
  }
  const unique = [...new Set(relativeFiles)].sort();
  // A runner started from inside `node --test` must not hand its test context on, or the child would behave as a worker of that run.
  const { NODE_TEST_CONTEXT, ...environment } = process.env;
  const tests = [];
  const problems = [];
  const diagnostics = [];
  const streams = {};
  await scratch(async (dir) => {
    for (const file of unique) {
      const destination = join(dir, 'stream.ndjson');
      const started = Date.now();
      const run = executeSync(process.execPath, ['--test', `--test-reporter=${REPORTER}`, `--test-reporter-destination=${destination}`, file], {
        cwd: root,
        env: isolatedEnvironment(dir, environment),
        timeout: timeoutMs,
      });
      // Hosting's timeout ends the child, but the status then is not always null (node --test answers the signal and exits with its own code), so the clock is read too.
      const stopped = run.status === null || run.signal !== null || Date.now() - started >= timeoutMs;
      const raw = (await kind(destination)) === 'file' ? (await readFile(destination)).toString('utf8') : '';
      streams[`${file.replaceAll('/', '__')}.ndjson`] = Buffer.from(raw);
      const events = [];
      let garbled = false;
      for (const line of raw.split('\n').filter(Boolean)) {
        try { events.push(JSON.parse(line)); } catch { garbled = true; }
      }
      const rebuilt = reconstruct(events, file);
      if (garbled) rebuilt.problems.push({ file, kind: 'unrecognised-output', detail: 'a reporter line is not JSON' });
      if (stopped) {
        // Stopped from outside: whatever was reported is partial.
        rebuilt.problems = rebuilt.problems.filter((p) => p.kind !== 'file-failed' && p.kind !== 'cancelled' && p.kind !== 'empty-inventory');
        rebuilt.problems.push({ file, kind: 'timeout', detail: `the file did not end within ${timeoutMs} ms and was stopped` });
      } else if (rebuilt.silent) {
        const first = run.stderr.split('\n').find((l) => l.trim()) ?? '';
        rebuilt.problems.push(run.status === 0 ? { file, kind: 'empty-inventory', detail: 'the file has no test' } : { file, kind: 'file-failed', detail: `exit ${run.status}: ${first}`.trim() });
      }
      const identified = identify(file, rebuilt, diagnostics);
      tests.push(...identified.tests);
      problems.push(...identified.problems);
    }
  });
  // `streamsDir` must be missing or empty: Hosting writes it whole, or not at all.
  if (streamsDir) await initialize(streamsDir, streams);
  tests.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const counts = { GREEN: 0, RED: 0, UNKNOWN: 0 };
  for (const t of tests) counts[t.actual] += 1;
  return { schema: SCHEMA, counts, tests, diagnostics, execution: { complete: problems.length === 0, timeoutMs, node: process.versions.node, files: unique, problems } };
}

/**
 * Compares two reports of the same kind of run. Pure and without a verdict: it lists, and kaal-change judges.
 * An added or removed test is provisional when the other side could not have reported it (its file's execution was incomplete or it did not run the file).
 */
export function compareReports(base, head) {
  const byId = (r) => new Map(r.tests.map((t) => [t.id, t]));
  const b = byId(base);
  const h = byId(head);
  const doubt = (report, file) => (!report.execution.files.includes(file) ? 'file not run' : report.execution.problems.some((p) => p.file === file) ? 'file had execution problems' : null);
  const changed = [];
  const added = [];
  const removed = [];
  for (const [id, t] of b) {
    const u = h.get(id);
    if (u && u.actual !== t.actual) changed.push({ id, from: t.actual, to: u.actual });
  }
  for (const [id, t] of h) {
    if (b.has(id)) continue;
    const why = doubt(base, t.file);
    added.push({ id, provisional: why !== null, ...(why ? { reason: `base: ${why}` } : {}) });
  }
  for (const [id, t] of b) {
    if (h.has(id)) continue;
    const why = doubt(head, t.file);
    removed.push({ id, provisional: why !== null, ...(why ? { reason: `head: ${why}` } : {}) });
  }
  return {
    changed,
    added,
    removed,
    complete: base.execution.complete && head.execution.complete,
    problems: { base: base.execution.problems, head: head.execution.problems },
    diagnostics: { base: base.diagnostics, head: head.diagnostics },
  };
}
