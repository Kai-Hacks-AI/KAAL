// retro/C1 Cases. Unwired: RED until the DO delivers the Skill.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { challenge4l } from './lib/record4l.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const pkg = path.resolve(here, '..', '..');
const skillDir = path.join(pkg, 'skills', 'kaal-retro');
const fixture = (n) => fs.readFileSync(path.join(here, 'fixtures', n), 'utf8');

function installAlone() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'retro-alone-'));
  const root = path.join(dir, 'kaal-retro');
  fs.cpSync(skillDir, root, { recursive: true });
  return root;
}
const read = (root, rel) => fs.readFileSync(path.join(root, rel), 'utf8');
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}
function links(file) {
  return [...fs.readFileSync(file, 'utf8').matchAll(/\]\(([^)#\s]+)(?:#[^)]*)?\)/g)].map((m) => m[1]).filter((l) => !/^[a-z]+:/i.test(l));
}
const section = (text, name) => {
  const m = text.match(new RegExp(`^#+ .*${name}.*$([\\s\\S]*?)(?=^#+ |(?![\\s\\S]))`, 'm'));
  return m ? m[1] : null;
};

test('retro/T1 the Skill installed alone is complete', () => {
  const root = installAlone();
  assert.match(read(root, 'SKILL.md'), /^---\nname: kaal-retro\n/);
  assert.ok(fs.existsSync(path.join(root, 'references', '4l.md')));
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
    const text = fs.readFileSync(f, 'utf8');
    assert.doesNotMatch(text, /\b(PDCA|WORK|GitHub|repository|hooks?|CI|rulesets?|kaal-(?!retro)[a-z]+|KAAL)\b/, `${f} names a KAAL or host prerequisite`);
  }
  assert.doesNotMatch(read(root, 'SKILL.md').split('---')[1], /^(requires|dependencies|depends)/m);
});

test('retro/T3 any subject, finished or ongoing, is in scope', () => {
  const text = read(installAlone(), 'SKILL.md');
  for (const w of ['completed', 'ongoing', 'decision', 'event', 'experience', 'process', 'product']) assert.match(text, new RegExp(w, 'i'), w);
  assert.doesNotMatch(text, /\b(only|never) (on|when|for) (completed|finished)\b/i);
});

test('retro/T4 4L is selected through its reference', () => {
  const root = installAlone();
  assert.ok(links(path.join(root, 'SKILL.md')).includes('references/4l.md'));
  const ref = read(root, 'references/4l.md');
  for (const c of ['Liked', 'Learned', 'Lacked', 'Longed For']) {
    const s = section(ref, c);
    assert.ok(s && /\?/.test(s), `${c} is defined with its question`);
  }
});

test('retro/T5 every 4L category can yield potential improvements, none ranked', () => {
  const ref = read(installAlone(), 'references/4l.md');
  for (const c of ['Liked', 'Learned', 'Lacked', 'Longed For']) assert.match(section(ref, c) ?? '', /improvement/i, c);
  assert.doesNotMatch(ref, /most actionable|more actionable|primary source of (improvements|changes)/i);
});

test('retro/T6 observations, interpretations and proposals are kept apart and nothing is authorized', () => {
  const text = read(installAlone(), 'SKILL.md');
  for (const w of ['observation', 'interpretation', 'improvement', 'owner', 'authoriz']) assert.match(text, new RegExp(w, 'i'), w);
  assert.match(text, /\b(not|never|no|nothing)\b[^.\n]*\b(Change|decision)/i, 'states that nothing is created or decided by the retro');
});

const EXPECTATIONS = [/method and subject/i, /all four/i, /label/i, /participants|views/i, /decision/i];
function expectationsStated() {
  const ref = read(installAlone(), 'references/4l.md');
  const r = section(ref, 'Result');
  assert.ok(r, 'references/4l.md has a Result section');
  const bullets = r.split('\n').filter((l) => /^- /.test(l));
  assert.ok(bullets.length >= 5, 'at least five expectations');
  for (const b of bullets) assert.match(b, /\b(because|so that)\b/i, `reason given: ${b}`);
  for (const e of EXPECTATIONS) assert.ok(bullets.some((b) => e.test(b)), `expectation ${e}`);
}

test('retro/T7 the 4L reference states what a result contains, with reasons', () => expectationsStated());

test('retro/T8 a conforming 4L record raises no finding', () => {
  expectationsStated();
  assert.deepEqual(challenge4l(fixture('good.md')), []);
});

test('retro/T9 defective 4L records raise their findings', () => {
  expectationsStated();
  const expected = {
    'missing-category.md': 'missing-category',
    'unlabeled.md': 'unlabeled-entry',
    'no-participants.md': 'no-participants',
    'decision-recorded.md': 'decision-recorded',
    'no-method.md': 'no-method',
  };
  for (const [f, id] of Object.entries(expected)) assert.deepEqual(challenge4l(fixture(f)), [id], f);
});

test('retro/T10 the trial accounts for instruction and evidence lookups and context per arm', () => {
  const t = JSON.parse(fs.readFileSync(path.join(pkg, 'plan', 'skill', 'trial.json'), 'utf8'));
  assert.ok(Array.isArray(t.runs) && t.runs.length >= 2);
  assert.deepEqual([...new Set(t.runs.map((r) => r.arm))].sort(), ['baseline', 'skill-only']);
  for (const r of t.runs) {
    for (const k of ['subject', 'instructionLookups', 'evidenceLookups', 'toolCalls', 'context']) assert.ok(k in r, `${r.arm} run has ${k}`);
    assert.ok(['measured', 'estimated', 'unavailable'].includes(r.context.basis), `${r.arm} context basis`);
    if (r.context.basis === 'unavailable') assert.equal(r.context.value, null);
    else assert.equal(typeof r.context.value, 'number');
    if (r.arm === 'skill-only') assert.equal(r.instructionLookups, 0);
  }
  for (const subject of new Set(t.runs.map((r) => r.subject))) {
    assert.equal(new Set(t.runs.filter((r) => r.subject === subject).map((r) => r.arm)).size, 2, `${subject} has both arms`);
  }
  assert.ok(typeof t.limitations === 'string' && t.limitations.length > 0);
});
