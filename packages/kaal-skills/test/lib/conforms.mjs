// The common evaluator of skills/C1. Test-only: it is not exported from the package and no capability imports it.
// conforms({ declaration, root, fixtures }) applies requirements F1-F7 to a declaration and returns, per requirement,
// a list of { status: 'PASS'|'FAIL'|'UNKNOWN', mechanism, detail }. verdict() folds a list: any FAIL, else any UNKNOWN, else PASS.
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const HOST = /\.githooks|pre-push|pre-commit|\.github[\\/]|workflows?\b|ruleset|GITHUB_|merge[ _-]queue/i;
const LEVELS = ['script', 'skill', 'agent'];
const KINDS = ['check', 'measure', 'remind', 'judgment'];
const REQUIRED = ['name', 'level', 'kind', 'docs'];
const CHILD = `const [mod, exp, fix, name, which] = process.argv.slice(1);
const m = await import(mod); const f = (await import(fix))[name]?.[which];
if (!f) { console.error('NOFIXTURE'); process.exit(3); }
if (typeof m[exp] !== 'function') { console.error('NOEXPORT'); process.exit(4); }
process.stdout.write(JSON.stringify(await m[exp](...f.args)));`;

const treeHash = (dir) => {
  const h = createHash('sha256');
  const walk = (d) => { for (const n of readdirSync(d).sort()) { if (n === 'node_modules') continue; const p = join(d, n); if (statSync(p).isDirectory()) walk(p); else h.update(p).update(readFileSync(p)); } };
  walk(dir); return h.digest('hex');
};
export const getAll = (v, path) => path.split('.').reduce((xs, part) => xs.flatMap((x) => {
  const many = part.endsWith('[]'); const k = many ? part.slice(0, -2) : part; const y = x?.[k];
  return many ? (Array.isArray(y) ? y : []) : y === undefined ? [] : [y];
}), [v]);
const classify = (r, o) => {
  const values = getAll(r, o.at);
  if (!values.length) return o.at.includes('[]') ? 'clear' : 'unmapped';
  if (values.some((v) => o.report?.includes(v))) return 'report';
  if (values.some((v) => o.unknown?.includes(v))) return 'unknown';
  return values.every((v) => o.clear?.includes(v)) ? 'clear' : 'unmapped';
};
export const verdict = (out) => Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.some((x) => x.status === 'FAIL') ? 'FAIL' : v.some((x) => x.status === 'UNKNOWN') ? 'UNKNOWN' : v.length ? 'PASS' : 'UNKNOWN']));

export async function conforms({ declaration: decl, root, fixtures }) {
  const out = { F1: [], F2: [], F3: [], F4: [], F5: [], F6: [], F7: [] };
  const add = (req, status, mechanism, detail) => out[req].push({ status, mechanism, detail });
  const pkg = resolve(root, decl.package ?? '.');
  const fixUrl = pathToFileURL(resolve(fixtures)).href;
  const fx = await import(fixUrl);
  const claimFile = join(pkg, 'ownership.kaal.json');
  const claim = existsSync(claimFile) ? JSON.parse(readFileSync(claimFile, 'utf8')).owner : null;
  if (!claim) add('F1', 'FAIL', null, 'no ownership claim beside the declaration');
  else if (JSON.stringify([claim.kind, claim.name, claim.id]) !== JSON.stringify([decl.owner?.kind, decl.owner?.name, decl.owner?.id])) add('F1', 'FAIL', null, 'owner differs from the ownership claim');
  const mechs = decl.mechanisms ?? [];
  if (!mechs.length) add('F1', 'FAIL', null, 'no mechanism declared');
  if (new Set(mechs.map((m) => m.name)).size !== mechs.length) add('F1', 'FAIL', null, 'duplicate mechanism name');
  for (const m of mechs) {
    const miss = REQUIRED.filter((k) => !m[k]);
    if (miss.length) add('F1', 'FAIL', m.name, `missing ${miss.join(', ')}`);
    if (!LEVELS.includes(m.level)) add('F1', 'FAIL', m.name, `level ${m.level}`);
    if (!KINDS.includes(m.kind)) add('F1', 'FAIL', m.name, `kind ${m.kind}`);
    if (m.docs && !existsSync(join(pkg, m.docs))) add('F1', 'FAIL', m.name, `docs ${m.docs} absent`);
    if (m.level === 'script') {
      const entry = m.invoke?.module ?? (Array.isArray(m.invoke?.command) ? m.invoke.command[1] : undefined);
      if (!entry) add('F1', 'FAIL', m.name, 'invoke names neither a module nor a command');
      else if (!existsSync(join(pkg, entry))) add('F1', 'FAIL', m.name, `invoke target ${entry} absent`);
    }
  }
  if (!out.F1.length) add('F1', 'PASS', null, `${mechs.length} mechanisms read, owner matches the ownership claim`);

  // Call a script mechanism with one fixture. Returns { result } or { status, detail } for UNKNOWN/FAIL.
  const call = (m, which) => {
    const before = treeHash(pkg);
    const tmp = mkdtempSync(join(tmpdir(), 'skills-proto-'));
    const cmd = m.invoke.command;
    const sets = fx[m.fixtures] ?? {};
    const run = cmd
      ? spawnSync(cmd[0] === 'node' ? process.execPath : cmd[0], [...cmd.slice(1), ...sets[which].args], { cwd: pkg, stdio: ['ignore', 'pipe', 'pipe'], timeout: 20000, encoding: 'utf8' })
      : spawnSync(process.execPath, ['--input-type=module', '-e', CHILD, pathToFileURL(join(pkg, m.invoke.module)).href, m.invoke.export, fixUrl, m.fixtures, which], { cwd: tmp, stdio: ['ignore', 'pipe', 'pipe'], timeout: 20000, encoding: 'utf8' });
    if (before !== treeHash(pkg)) return { status: 'FAIL', detail: `${which}: changed its package tree` };
    const err = (run.stderr || '').trim().split('\n').find((l) => /Error|NO[A-Z]+/.test(l)) ?? '';
    if (cmd) {
      // A command's result is { exit, stdout }: stdout parsed as JSON when it is JSON. Its exit status is part of the result, so a reader may use it.
      if (run.error || run.status === null) return { status: 'FAIL', detail: `${which}: did not finish (${run.error?.code ?? run.signal})` };
      let stdout = run.stdout; try { stdout = JSON.parse(run.stdout); } catch { /* text */ }
      return { result: { exit: run.status, stdout }, detail: `${which}: ran as a command with stdin closed, returned exit and output, changed nothing in its package` };
    }
    if (run.status !== 0) return /ERR_MODULE_NOT_FOUND|Cannot find (package|module)/.test(run.stderr) ? { status: 'UNKNOWN', detail: `${which}: cannot load here (${err.slice(0, 90)})` } : { status: 'FAIL', detail: `${which}: exit ${run.status} ${err}` };
    try { return { result: JSON.parse(run.stdout), detail: `${which}: ran with stdin closed, returned data, changed nothing in its package` }; }
    catch { return { status: 'FAIL', detail: `${which}: result is not data` }; }
  };

  const results = {};
  for (const m of mechs.filter((x) => x.level === 'script')) {
    const sets = fx[m.fixtures] ?? {};
    for (const which of m.kind === 'check' ? ['clear', 'report', 'unknown'] : m.kind === 'remind' ? ['remind'] : ['clear']) {
      if (!sets[which]) { add('F2', 'UNKNOWN', m.name, `${which}: no fixture offered`); continue; }
      const r = call(m, which);
      if (r.result === undefined) { add('F2', r.status, m.name, r.detail); continue; }
      results[`${m.name}/${which}`] = r.result; add('F2', 'PASS', m.name, r.detail);
    }
    if (m.kind !== 'check') continue;
    const lists = ['clear', 'report', 'unknown'].map((c) => m.outcome?.[c] ?? []);
    const overlap = lists.flat().find((v, i, a) => a.indexOf(v) !== i);
    if (overlap !== undefined) { add('F3', 'FAIL', m.name, `"${overlap}" is listed under more than one outcome`); continue; }
    const got = ['clear', 'report', 'unknown'].map((w) => (results[`${m.name}/${w}`] === undefined ? null : classify(results[`${m.name}/${w}`], m.outcome)));
    if (got.includes(null)) { add('F3', 'UNKNOWN', m.name, 'not all three fixtures ran'); add('F4', 'UNKNOWN', m.name, 'not all three fixtures ran'); continue; }
    const [c, r, u] = got;
    if (u === 'clear') add('F3', 'FAIL', m.name, 'an undecidable input reads as clear');
    else if (c !== 'clear' || r !== 'report' || u !== 'unknown') add('F3', 'FAIL', m.name, `fixtures read ${got.join('/')}, expected clear/report/unknown`);
    else {
      const bad = ['report', 'unknown'].filter((w) => !(m.reason ?? []).some((p) => getAll(results[`${m.name}/${w}`], p).some((s) => typeof s === 'string' && s.trim())));
      bad.length ? add('F3', 'FAIL', m.name, `${bad.join(' and ')} result carries no reason in ${JSON.stringify(m.reason)}`) : add('F3', 'PASS', m.name, 'reads clear/report/unknown, unknown is not clear, each non-clear result carries a reason');
    }
    new Set(got).size === 3 ? add('F4', 'PASS', m.name, 'its rule is told apart through the declared invocation alone') : add('F4', 'FAIL', m.name, 'fixtures do not reach three distinct outcomes');
  }
  for (const m of mechs.filter((x) => x.level !== 'script')) {
    const f = resolve(pkg, m.skill ?? '/nonexistent');
    const text = existsSync(f) ? readFileSync(f, 'utf8') : '';
    const probs = [];
    if (!/^---\nname: /.test(text)) probs.push('no Skill file with a name');
    if (m.section && !new RegExp(`^#+ ${m.section}\\s*$`, 'm').test(text)) probs.push(`section "${m.section}" absent`);
    if (!m.shape || !Array.isArray(m.shape.fields) || !m.shape.fields.length) probs.push('no result shape');
    if (m.outcome) probs.push('a judgment mechanism declares pass/fail outcomes');
    probs.length ? add('F5', 'FAIL', m.name, probs.join('; ')) : add('F5', 'PASS', m.name, 'Skill, section and result shape are declared, and no outcome is claimed');
    // F7: the activation is obtained by invoking a declared script mechanism of kind remind; it points and decides nothing.
    const a = m.activation; const skillName = text.match(/^name: (.+)$/m)?.[1]?.trim();
    if (a === undefined) { add('F7', 'UNKNOWN', m.name, 'no activation declared yet: unknown, never conforming'); continue; }
    const ap = [];
    if (!a || typeof a !== 'object') ap.push('activation is not an object');
    else {
      if (typeof a.when !== 'string' || !a.when.trim()) ap.push('no situation (when)');
      if ('reminder' in a) ap.push('the reminder is data in the declaration; it must come from an invocable mechanism');
      if (a.outcome || a.gate) ap.push('an activation claims an outcome or a gate');
      const r = mechs.find((x) => x.name === a.invoke);
      if (!r) ap.push(`invoke names no declared mechanism (${JSON.stringify(a.invoke)})`);
      else if (r.level !== 'script' || r.kind !== 'remind') ap.push(`${r.name} is not a script mechanism of kind remind`);
      else if (r.outcome) ap.push(`${r.name} claims an outcome`);
      else {
        const got = results[`${r.name}/remind`];
        const reminder = got === undefined ? undefined : (getAll(got, 'reminder')[0] ?? getAll(got, 'stdout.reminder')[0]);
        if (got === undefined) ap.push(`${r.name} did not run (see F2)`);
        else if (typeof reminder !== 'string' || !reminder.trim()) ap.push(`${r.name} returned no reminder`);
        else {
          if (reminder.length > 280) ap.push('reminder longer than 280 characters');
          if (!skillName) ap.push('no Skill file to point at');
          else if (!reminder.includes(skillName)) ap.push('reminder does not name the Skill');
          if (m.section && !reminder.includes(m.section)) ap.push('reminder does not point at the section');
        }
      }
    }
    ap.length ? add('F7', 'FAIL', m.name, ap.join('; ')) : add('F7', 'PASS', m.name, 'an integrator that invokes the declared remind mechanism receives a short reminder naming the Skill and the section, and decides nothing');
  }
  const hit = JSON.stringify(decl).match(HOST); // the declaration only: scanning prose false-positives (evidence.md)
  hit ? add('F6', 'FAIL', null, `names a host trigger: "${hit[0]}"`) : add('F6', 'PASS', null, 'the declaration names no hook, workflow, ruleset or queue');
  return out;
}

/** Find the declarations of the packages under <root>/packages by convention (no registry). A package without one is returned with status UNKNOWN. */
export async function discover(root) {
  return readdirSync(join(root, 'packages')).sort().filter((d) => statSync(join(root, 'packages', d)).isDirectory()).map((d) => {
    const f = join(root, 'packages', d, 'integration.kaal.json');
    return existsSync(f)
      ? { package: `packages/${d}`, declaration: JSON.parse(readFileSync(f, 'utf8')) }
      : { package: `packages/${d}`, declaration: null, status: 'UNKNOWN', reason: 'no integration.kaal.json: not declared' };
  });
}
