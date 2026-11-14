// THROWAWAY PROTOTYPE (skills/C1 PLAN evidence). Not the DO, not delivered, not a runtime.
// conforms({ declaration, root, fixtures }) applies requirements F1-F6 to a declaration and returns, per requirement,
// a list of { status: 'PASS'|'FAIL'|'UNKNOWN', mechanism, detail }. verdict() folds a list: any FAIL, else any UNKNOWN, else PASS.
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const HOST = /\.githooks|pre-push|pre-commit|\.github[\\/]|workflows?\b|ruleset|GITHUB_|merge[ _-]queue/i;
const LEVELS = ['script', 'skill', 'agent'];
const KINDS = ['check', 'measure', 'judgment'];
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

  const results = {};
  for (const m of mechs.filter((x) => x.level === 'script')) {
    const sets = fx[m.fixtures] ?? {};
    for (const which of m.kind === 'check' ? ['clear', 'report', 'unknown'] : ['clear']) {
      if (!sets[which]) { add('F2', 'UNKNOWN', m.name, `${which}: no fixture offered`); continue; }
      const before = treeHash(pkg);
      const tmp = mkdtempSync(join(tmpdir(), 'skills-proto-'));
      const cmd = m.invoke.command;
      const run = cmd
        ? spawnSync(cmd[0] === 'node' ? process.execPath : cmd[0], [...cmd.slice(1), ...sets[which].args], { cwd: pkg, stdio: ['ignore', 'pipe', 'pipe'], timeout: 20000, encoding: 'utf8' })
        : spawnSync(process.execPath, ['--input-type=module', '-e', CHILD, pathToFileURL(join(pkg, m.invoke.module)).href, m.invoke.export, fixUrl, m.fixtures, which], { cwd: tmp, stdio: ['ignore', 'pipe', 'pipe'], timeout: 20000, encoding: 'utf8' });
      const after = treeHash(pkg);
      if (before !== after) { add('F2', 'FAIL', m.name, `${which}: changed its package tree`); continue; }
      const err = (run.stderr || '').trim().split('\n').find((l) => /Error|NO[A-Z]+/.test(l)) ?? '';
      if (cmd) {
        // A command's result is { exit, stdout }: stdout parsed as JSON when it is JSON. Its exit status is part of the result, so a reader may use it.
        if (run.error || run.status === null) { add('F2', 'FAIL', m.name, `${which}: did not finish (${run.error?.code ?? run.signal})`); continue; }
        let stdout = run.stdout; try { stdout = JSON.parse(run.stdout); } catch { /* text */ }
        results[`${m.name}/${which}`] = { exit: run.status, stdout };
        add('F2', 'PASS', m.name, `${which}: ran as a command with stdin closed, returned exit and output, changed nothing in its package`);
        continue;
      }
      if (run.status !== 0) { /ERR_MODULE_NOT_FOUND|Cannot find (package|module)/.test(run.stderr) ? add('F2', 'UNKNOWN', m.name, `${which}: cannot load here (${err.slice(0, 90)})`) : add('F2', 'FAIL', m.name, `${which}: exit ${run.status} ${err}`); continue; }
      try { results[`${m.name}/${which}`] = JSON.parse(run.stdout); add('F2', 'PASS', m.name, `${which}: ran with stdin closed, returned data, changed nothing in its package`); }
      catch { add('F2', 'FAIL', m.name, `${which}: result is not data`); }
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
    // F7: the activation points an agent at the Skill; it decides nothing.
    const a = m.activation; const skillName = text.match(/^name: (.+)$/m)?.[1]?.trim();
    const ap = [];
    if (!a || typeof a !== 'object') ap.push('no activation');
    else {
      if (typeof a.when !== 'string' || !a.when.trim()) ap.push('no situation (when)');
      if (typeof a.reminder !== 'string' || !a.reminder.trim()) ap.push('no reminder');
      else {
        if (a.reminder.length > 280) ap.push('reminder longer than 280 characters');
        if (!skillName) ap.push('no Skill file to point at');
        else if (!a.reminder.includes(skillName)) ap.push('reminder does not name the Skill');
        if (m.section && !a.reminder.includes(m.section)) ap.push('reminder does not point at the section');
      }
      if (a.outcome || a.gate) ap.push('an activation claims an outcome or a gate');
    }
    ap.length ? add('F7', 'FAIL', m.name, ap.join('; ')) : add('F7', 'PASS', m.name, 'a situation and a reminder naming the Skill are declared; the integrator chooses the trigger');
  }
  const hit = JSON.stringify(decl).match(HOST); // the declaration only: scanning prose false-positives (evidence.md)
  hit ? add('F6', 'FAIL', null, `names a host trigger: "${hit[0]}"`) : add('F6', 'PASS', null, 'the declaration names no hook, workflow, ruleset or queue');
  return out;
}
