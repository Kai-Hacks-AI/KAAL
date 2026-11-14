// retro/C1 Cases. Unwired: RED until the DO delivers the Skill and the checker.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(here, '..', '..');
const skillDir = path.join(pkg, 'skills', 'kaal-retro');
const fixture = (name) => fs.readFileSync(path.join(here, 'fixtures', name), 'utf8');
const checker = async () => (await import(pathToFileURL(path.join(pkg, 'scripts', 'check-retro.mjs')))).checkRetro;
const reasons = (r) => r.findings.map((f) => f.id);

function installAlone() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'retro-alone-'));
  fs.cpSync(skillDir, path.join(dir, 'kaal-retro'), { recursive: true });
  return path.join(dir, 'kaal-retro');
}
function links(file) {
  const text = fs.readFileSync(file, 'utf8');
  return [...text.matchAll(/\]\(([^)#\s]+)(?:#[^)]*)?\)/g)].map((m) => m[1]).filter((l) => !/^[a-z]+:/i.test(l));
}
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}

test('retro/T1 the Skill installed alone is complete', () => {
  const root = installAlone();
  assert.ok(fs.existsSync(path.join(root, 'SKILL.md')));
  assert.ok(fs.existsSync(path.join(root, 'references', '4l.md')));
  assert.match(fs.readFileSync(path.join(root, 'SKILL.md'), 'utf8'), /^---\nname: kaal-retro\n/);
  for (const f of walk(root).filter((p) => p.endsWith('.md'))) {
    for (const l of links(f)) assert.ok(fs.existsSync(path.resolve(path.dirname(f), l)), `${f} links ${l}`);
  }
});

test('retro/T2 the installed Skill depends on nothing outside itself', () => {
  const root = installAlone();
  const files = walk(root);
  assert.deepEqual(files.map((f) => path.relative(root, f).split(path.sep).join('/')).sort(), ['SKILL.md', 'references/4l.md']);
  for (const f of files) {
    for (const l of links(f)) assert.ok(path.resolve(path.dirname(f), l).startsWith(root + path.sep), `${f} escapes via ${l}`);
  }
  const head = fs.readFileSync(path.join(root, 'SKILL.md'), 'utf8').split('---')[1];
  assert.doesNotMatch(head, /^(requires|dependencies|depends)/m);
});

test('retro/T3 arbitrary and ongoing subjects are valid', async () => {
  const check = await checker();
  assert.equal(check(fixture('clear-trip.md')).outcome, 'clear');
  assert.equal(check(fixture('clear-ongoing.md')).outcome, 'clear');
});

test('retro/T4 4L is reached through its reference and enforced as four categories', async () => {
  const skill = fs.readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8');
  assert.ok(links(path.join(skillDir, 'SKILL.md')).includes('references/4l.md'));
  const ref = fs.readFileSync(path.join(skillDir, 'references', '4l.md'), 'utf8');
  for (const c of ['Liked', 'Learned', 'Lacked', 'Longed For']) assert.match(ref, new RegExp(`^#+ .*${c}`, 'm'));
  assert.ok(skill.length > 0);
  const r = (await checker())(fixture('missing-category.md'));
  assert.equal(r.outcome, 'report');
  assert.ok(reasons(r).includes('missing-category'));
});

test('retro/T5 every 4L category can yield a proposal', async () => {
  const r = (await checker())(fixture('clear-trip.md'));
  assert.deepEqual(r.proposalsByCategory, { Liked: 1, Learned: 1, Lacked: 1, 'Longed For': 1 });
});

test('retro/T6 observations, interpretations and proposals stay distinct', async () => {
  const check = await checker();
  const a = check(fixture('unlabeled.md'));
  assert.equal(a.outcome, 'report');
  assert.ok(reasons(a).includes('unlabeled-entry'));
  const b = check(fixture('proposal-as-decided.md'));
  assert.equal(b.outcome, 'report');
  assert.ok(reasons(b).includes('decision-in-entry'));
});

test('retro/T7 no Change is created and no decision is authorized by the retro', async () => {
  const check = await checker();
  const a = check(fixture('creates-change.md'));
  assert.equal(a.outcome, 'report');
  assert.ok(reasons(a).includes('automatic-change'));
  const b = check(fixture('decision-no-owner.md'));
  assert.equal(b.outcome, 'report');
  assert.ok(reasons(b).includes('decision-without-owner'));
  const before = walk(pkg).map((f) => [f, fs.statSync(f).mtimeMs]);
  check(fixture('clear-trip.md'));
  assert.deepEqual(walk(pkg).map((f) => [f, fs.statSync(f).mtimeMs]), before);
});

test('retro/T8 an unreadable record is unknown, never clear', async () => {
  const check = await checker();
  for (const input of ['', '   \n', 'just some words', undefined]) {
    const r = check(input);
    assert.equal(r.outcome, 'unknown');
    assert.ok(r.findings.length > 0);
  }
});
