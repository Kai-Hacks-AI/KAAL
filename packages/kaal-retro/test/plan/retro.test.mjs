// retro/C1 Cases. Unwired: RED until the DO delivers the Skill.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const skillDir = path.resolve(here, '..', '..', 'skills', 'kaal-retro');

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
