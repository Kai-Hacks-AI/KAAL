// The runner of verify Adapter (release/C139): reads the merge result of a pull request as a folder, as data and never run, and asks controls' verify Adapter
// (controls/F206) whether each delivered control integrates the adapter, through the adapter itself (controls/C141) in detective mode.
//   node run-verify-adapter.mjs --map <delivery-map.json> --pr <merge result folder>
// The map is the default branch's. The judge code (recognize-adapter.mjs, verify-adapter.mjs, adapter.mjs) is the default branch's too, never the pull request's.
// Everything observed is structural: that a delivered file names its entry, and that the entry shows an integration with the adapter. Nothing here observes that an entry ran,
// so no `adapted: false` is ever made here, and what cannot be established is UNKNOWN, never a FAIL and never a pass.
// Environment: KAAL_FLAG (exactly `on` makes a FAIL or an UNKNOWN exit 1), KAAL_PR, KAAL_MERGE_SHA, KAAL_RUN_ID.
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';
import { dirname, isAbsolute, join, posix, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRIPTS = join(HERE, '../../../../packages/kaal-controls/skills/kaal-controls/scripts');
const CONTROL = 'controls/CTL1';
// A line that runs a script of the repository: a path to a script file, or the guard that runs the checks of the repository.
const RUNS_SCRIPT = /(?:[\w./$-]+\.(?:mjs|cjs|js|ts|sh)\b|\bkaal-guard\b)/;

// The files under a declared directory, or null when it cannot be inspected. A directory that is missing, not a directory, a dangling link or unreadable is not an empty one.
const inspect = (dir, rel = '') => {
  try {
    if (!statSync(dir).isDirectory()) return null;
    const out = [];
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) { const inner = inspect(join(dir, e.name), `${rel}${e.name}/`); if (inner === null) return null; out.push(...inner); }
      else out.push(`${rel}${e.name}`);
    }
    return out;
  } catch { return null; }
};
const read = (file) => { try { return readFileSync(file, 'utf8'); } catch { return null; } };
// The Git blob id of some bytes: what `git hash-object` says of them. The digest of an inspected file is computed from the bytes the runner read, never from a name or a sha.
export const blobId = (bytes) => createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
const mentions = (text, path) => text.split('\n').some((l) => !/^\s*#/.test(l) && new RegExp(`(^|[^\\w./-])${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^\\w./-])`).test(l));
const invokesScript = (text) => text.split('\n').some((l) => !/^\s*#/.test(l) && RUNS_SCRIPT.test(l) && !/^\s*(uses|name|with|ref|path|node-version):/.test(l));

// Everything the run can say, as lists: the structural observations and every reason for UNKNOWN. Pure over the folder and the map.
const text = (v) => typeof v === 'string' && v.length > 0;

// The map is complete or it is not used: the delivered directories it inventories, its rows, and its list of exclusions. Returns the reasons it is not.
export function mapProblems(map) {
  if (!map || typeof map !== 'object' || Array.isArray(map)) return ['map:the delivery map is not an object'];
  const problems = [];
  if (!Array.isArray(map.inventory) || map.inventory.length === 0 || !map.inventory.every(text)) problems.push('map:inventory is not a non-empty list of directories');
  if (!Array.isArray(map.rows) || map.rows.length === 0) problems.push('map:rows is not a non-empty list');
  else for (const r of map.rows) if (!r || typeof r !== 'object' || !text(r.control) || !text(r.delivered) || !text(r.entry)) problems.push(`malformed:${r && typeof r === 'object' && text(r.control) ? r.control : 'a row of the map'}`);
  if (!Array.isArray(map.notControls)) problems.push('map:notControls is not a list');
  else for (const n of map.notControls) if (!n || typeof n !== 'object' || !text(n.path)) problems.push('malformed:an exclusion of the map');
  return problems;
}

// Everything the run can say, as lists: the structural observations and every reason for UNKNOWN. Pure over the folder and the map.
export async function observe({ map, pr, revision, recognize, digests = {} }) {
  const unknown = mapProblems(map);
  if (unknown.length > 0) return { rows: [], observed: [], unknown: unknown.sort(), digests };
  // Every file read of the merge result is digested from the bytes read, keyed by its path in the merge result.
  const read = (rel) => { try { const bytes = readFileSync(join(pr, rel)); digests[rel] = blobId(bytes); return bytes.toString('utf8'); } catch { return null; } };
  const rows = map.rows;
  const notControls = map.notControls;
  const observed = [];

  // The inventory is checked against the delivered files, independently of the map, in the directories the map declares. One that cannot be inspected is UNKNOWN naming it.
  const present = [];
  for (const d of map.inventory) {
    const files = inspect(join(pr, d));
    if (files === null) unknown.push(`uninspectable:${d}`);
    else present.push(...files.map((f) => `${d}/${f}`));
  }
  present.sort();
  const claimed = new Set(rows.map((r) => r.delivered));
  for (const f of present) {
    if (claimed.has(f)) continue;
    const excluded = notControls.find((n) => n.path === f);
    if (!excluded) { unknown.push(`unclaimed:${f}`); continue; }
    const text = read(f);
    if (!excluded.reason) unknown.push(`unjustified:${f}`);
    else if (text === null) unknown.push(`unreadable:${f}`);
    else if (invokesScript(text)) unknown.push(`unjustified:${f}`);
  }
  for (const n of notControls) if (claimed.has(n.path)) unknown.push(`unjustified:${n.path}`);

  // Per row, on its own: an entry claimed twice has no single identity; a delivered file that does not name its entry is not established.
  const byEntry = new Map();
  for (const r of rows) byEntry.set(r.entry, [...(byEntry.get(r.entry) ?? []), r.control]);
  for (const r of rows) {
    if (!r || !r.control || !r.delivered || !r.entry) { unknown.push(`malformed:${r?.control ?? '?'}`); continue; }
    if (byEntry.get(r.entry).length > 1) { unknown.push(`ambiguous:${r.control}`); continue; }
    const delivered = read(r.delivered);
    if (delivered === null) { unknown.push(`unreadable:${r.delivered}`); continue; }
    if (!mentions(delivered, r.entry)) { unknown.push(`uninvoked:${r.control}`); continue; }
    const entry = read(r.entry);
    if (entry === null) { unknown.push(`unreadable:${r.entry}`); continue; }
    const adapter = map.adapter ?? posix.join(posix.dirname(r.entry), 'adapter.mjs');
    try { observed.push(recognize({ control: r.control, entry: { path: r.entry, text: entry }, adapter, revision })); } catch { /* no recognizable integration: the control stays unobserved, which verify Adapter names */ }
  }
  return { rows, observed, unknown: unknown.sort(), digests };
}

// `--bind <evidence file> --git <repo>`: the inspected bytes are the recorded revision's. Re-reads each digested path from Git at the recorded merge sha and compares. Anything else is UNKNOWN.
export function bind(evidenceFile, repo) {
  const git = (...a) => spawnSync('git', ['-C', repo, ...a], { encoding: 'utf8' });
  let ev = null;
  const raw = read(evidenceFile);
  try { ev = raw === null ? null : JSON.parse(raw.replace(/^\s*adapter-evidence\s+/, '')); } catch { ev = null; }
  if (!ev || typeof ev !== 'object' || Array.isArray(ev)) return { ok: false, text: 'UNKNOWN: malformed: the file is not evidence of verify Adapter' };
  const why = [];
  if (!text(ev.merge)) why.push('merge: the evidence records no merge sha');
  else if (git('rev-parse', '--verify', '--quiet', `${ev.merge}^{commit}`).status !== 0) why.push(`merge: ${ev.merge} does not resolve in the repository`);
  const digests = ev.digests;
  if (!digests || typeof digests !== 'object' || Array.isArray(digests) || Object.keys(digests).length === 0) why.push('digests: the evidence records no digest of an inspected file');
  if (why.length === 0) for (const [path, id] of Object.entries(digests).sort()) {
    const at = git('rev-parse', '--verify', '--quiet', `${ev.merge}:${path}`);
    if (at.status !== 0) why.push(`${path}: not present at the merge sha`);
    else if (at.stdout.trim() !== id) why.push(`${path}: the inspected bytes are not the revision's`);
  }
  return why.length ? { ok: false, text: `UNKNOWN: ${why.join(', ')}` } : { ok: true, text: `BOUND: the ${Object.keys(digests).length} inspected files are the bytes of ${ev.merge} (structure only; nothing here observes that an entry ran).` };
}

export async function main(argv, env) {
  const at = (k) => { const i = argv.indexOf(k); return i < 0 ? undefined : argv[i + 1]; };
  if (at('--bind')) { const r = bind(at('--bind'), at('--git') ?? '.'); console.log(r.text); return r.ok ? 0 : 1; }
  const mapFile = at('--map'); const pr = at('--pr');
  const [{ runControl }, { findUnadapted }, { recognizeIntegration }] = await Promise.all(['adapter', 'verify-adapter', 'recognize-adapter'].map((m) => import(pathToFileURL(join(SCRIPTS, `${m}.mjs`)).href)));
  const digests = {};
  const mapText = mapFile ? read(mapFile) : null;
  // The map is the default branch's; its bytes are digested only when it lies inside the merge result, where they can be bound to its revision.
  if (mapText !== null && pr) { const rel = relative(resolve(pr), resolve(mapFile)); if (rel && !rel.startsWith('..') && !isAbsolute(rel)) digests[rel.split('\\').join('/')] = blobId(readFileSync(mapFile)); }
  let map = null;
  try { map = mapText === null ? null : JSON.parse(mapText); } catch { map = null; }
  const revision = env.KAAL_MERGE_SHA || 'merge';
  const run = env.KAAL_RUN_ID ?? null;
  const prNumber = env.KAAL_PR ? Number(env.KAAL_PR) : null;

  const reasons = [];
  let controls = [];
  const verdict = await (async () => {
    if (!map || !pr || !existsSync(pr)) { reasons.push(map ? 'unreadable:the pull request folder' : 'unreadable:the delivery map'); return runControl({ id: CONTROL, mode: 'detective', check: () => { throw new Error('cannot read'); }, input: {}, boundary: { run, sha: revision } }); }
    const seen = await observe({ map, pr, revision, recognize: recognizeIntegration, digests });
    controls = seen.rows.map((r) => r.control);
    reasons.push(...seen.unknown);
    const result = await runControl({
      id: CONTROL, mode: 'detective', boundary: { run, sha: revision },
      input: { seen },
      check: ({ seen: s }) => {
        let findings = [];
        try { findings = findUnadapted({ controls: s.rows.map((r) => ({ id: r.control })), delivered: s.rows.map((r) => r.control), observed: s.observed, revision }); }
        catch (e) { reasons.push(...(e.unknown ?? [e.message])); throw Object.assign(new Error('unknown'), { confirmed: e.confirmed ?? [] }); }
        if (s.unknown.length > 0) throw Object.assign(new Error('unknown'), { confirmed: findings });
        return findings;
      },
    });
    return result;
  })();

  const names = [...new Set(reasons)].sort();
  const out = verdict.verdict === 'PASS'
    ? `PASS: all ${controls.length} delivered controls show an integration with the adapter (structure only; nothing here observes that an entry ran).`
    : `${verdict.verdict}: ${names.length ? names.join(', ') : 'cannot be established'}`;
  const line = `adapter-evidence ${JSON.stringify({ kind: 'verify-adapter', pr: prNumber, merge: revision, run, verdict: verdict.verdict, findings: verdict.log.findings, digests })}`;
  console.log(out);
  console.log(line);
  if (env.GITHUB_STEP_SUMMARY) appendFileSync(env.GITHUB_STEP_SUMMARY, `${out}\n\n\`${line}\`\n`);
  return env.KAAL_FLAG === 'on' && verdict.verdict !== 'PASS' ? 1 : 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exit(await main(process.argv.slice(2), process.env));
