// The runner of verify Adapter (release/C139): reads the merge result of a pull request as a folder, as data and never run, and asks controls' verify Adapter
// (controls/F206) whether each delivered control integrates the adapter, through the adapter itself (controls/C141) in detective mode.
//   node run-verify-adapter.mjs --map <delivery-map.json> --pr <merge result folder>
// The map is the default branch's. The judge code (recognize-adapter.mjs, verify-adapter.mjs, adapter.mjs) is the default branch's too, never the pull request's.
// Everything observed is structural: that a delivered file names its entry, and that the entry shows an integration with the adapter. Nothing here observes that an entry ran,
// so no `adapted: false` is ever made here, and what cannot be established is UNKNOWN, never a FAIL and never a pass.
// Environment: KAAL_FLAG (exactly `on` makes a FAIL or an UNKNOWN exit 1), KAAL_PR, KAAL_MERGE_SHA, KAAL_RUN_ID.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { appendFileSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRIPTS = join(HERE, '../../../../packages/kaal-controls/skills/kaal-controls/scripts');
const CONTROL = 'controls/CTL1';
const DELIVERED = ['.github/workflows', '.githooks'];
// A line that runs a script of the repository: a path to a script file, or the guard that runs the checks of the repository.
const RUNS_SCRIPT = /(?:[\w./$-]+\.(?:mjs|cjs|js|ts|sh)\b|\bkaal-guard\b)/;

const walk = (dir, rel = '') => (existsSync(dir)
  ? readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name), `${rel}${e.name}/`) : [`${rel}${e.name}`]))
  : []);
const read = (file) => { try { return readFileSync(file, 'utf8'); } catch { return null; } };
const mentions = (text, path) => text.split('\n').some((l) => !/^\s*#/.test(l) && new RegExp(`(^|[^\\w./-])${path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^\\w./-])`).test(l));
const invokesScript = (text) => text.split('\n').some((l) => !/^\s*#/.test(l) && RUNS_SCRIPT.test(l) && !/^\s*(uses|name|with|ref|path|node-version):/.test(l));

// Everything the run can say, as lists: the structural observations and every reason for UNKNOWN. Pure over the folder and the map.
export async function observe({ map, pr, revision, recognize }) {
  const unknown = [];
  const rows = Array.isArray(map?.rows) ? map.rows : [];
  const notControls = Array.isArray(map?.notControls) ? map.notControls : [];
  const observed = [];

  // The inventory is checked against the delivered files, independently of the map.
  const present = DELIVERED.flatMap((d) => walk(join(pr, d)).map((f) => `${d}/${f}`)).sort();
  const claimed = new Set(rows.map((r) => r.delivered));
  for (const f of present) {
    if (claimed.has(f)) continue;
    const excluded = notControls.find((n) => n.path === f);
    if (!excluded) { unknown.push(`unclaimed:${f}`); continue; }
    const text = read(join(pr, f));
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
    const delivered = read(join(pr, r.delivered));
    if (delivered === null) { unknown.push(`unreadable:${r.delivered}`); continue; }
    if (!mentions(delivered, r.entry)) { unknown.push(`uninvoked:${r.control}`); continue; }
    const entry = read(join(pr, r.entry));
    if (entry === null) { unknown.push(`unreadable:${r.entry}`); continue; }
    const adapter = map.adapter ?? posix.join(posix.dirname(r.entry), 'adapter.mjs');
    try { observed.push(recognize({ control: r.control, entry: { path: r.entry, text: entry }, adapter, revision })); } catch { /* no recognizable integration: the control stays unobserved, which verify Adapter names */ }
  }
  return { rows, observed, unknown: unknown.sort() };
}

export async function main(argv, env) {
  const at = (k) => { const i = argv.indexOf(k); return i < 0 ? undefined : argv[i + 1]; };
  const mapFile = at('--map'); const pr = at('--pr');
  const [{ runControl }, { findUnadapted }, { recognizeIntegration }] = await Promise.all(['adapter', 'verify-adapter', 'recognize-adapter'].map((m) => import(pathToFileURL(join(SCRIPTS, `${m}.mjs`)).href)));
  const mapText = mapFile ? read(mapFile) : null;
  let map = null;
  try { map = mapText === null ? null : JSON.parse(mapText); } catch { map = null; }
  const revision = env.KAAL_MERGE_SHA || 'merge';
  const run = env.KAAL_RUN_ID ?? null;
  const prNumber = env.KAAL_PR ? Number(env.KAAL_PR) : null;

  const reasons = [];
  let controls = [];
  const verdict = await (async () => {
    if (!map || !pr || !existsSync(pr)) { reasons.push(map ? 'unreadable:the pull request folder' : 'unreadable:the delivery map'); return runControl({ id: CONTROL, mode: 'detective', check: () => { throw new Error('cannot read'); }, input: {}, boundary: { run, sha: revision } }); }
    const seen = await observe({ map, pr, revision, recognize: recognizeIntegration });
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
  const line = `adapter-evidence ${JSON.stringify({ kind: 'verify-adapter', pr: prNumber, merge: revision, run, verdict: verdict.verdict, findings: verdict.log.findings })}`;
  console.log(out);
  console.log(line);
  if (env.GITHUB_STEP_SUMMARY) appendFileSync(env.GITHUB_STEP_SUMMARY, `${out}\n\n\`${line}\`\n`);
  return env.KAAL_FLAG === 'on' && verdict.verdict !== 'PASS' ? 1 : 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exit(await main(process.argv.slice(2), process.env));
