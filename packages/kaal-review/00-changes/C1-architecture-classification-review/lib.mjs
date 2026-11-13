// Shared by the Cases of this Change: reads the review record and checks the reviewer's own recorded trial.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = join(dirname(fileURLToPath(import.meta.url)));
export const dir = join(here, '../..');
export const REVIEW = '00-changes/C1-architecture-classification-review/review.md';
const T = '00-changes/C1-architecture-classification-review/trial/';
const sha = (s) => createHash('sha256').update(s).digest('hex');
export const read = (rel, what) => { const p = join(dir, rel); assert.ok(existsSync(p), `${what} is absent`); return readFileSync(p, 'utf8'); };
export function section(name) {
  const md = read(REVIEW, 'the review record');
  const m = md.match(new RegExp(`^## ${name}\\s*$([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, 'm'));
  assert.ok(m && m[1].trim().length > 0, `the review record has no chapter "${name}" or it is empty`);
  return m[1];
}
// `author-statements.json` is a snapshot of the author's ten statements, taken from the work under review at the commit named in review.md.
// A reviewer trial is valid with provenance: a key of the reviewer fixed before the runs, its hash in every record,
// a prompt that holds the statements and nothing of the key, raw output equal to the recorded answers, an observer who is not the author.
export function trial() {
  const keyText = read(`${T}key.json`, 'the reviewer key');
  const key = JSON.parse(keyText).scenarios;
  const authorKey = JSON.parse(read(`${T}author-statements.json`, 'the snapshot of the author statements')).statements;
  for (const s of key) assert.ok(!authorKey.includes(s.statement), `${s.id}: the statement is the author's`);
  assert.ok(key.length >= 8, 'the reviewer key holds fewer than eight statements');
  const runs = { skill: [], baseline: [] };
  for (const arm of Object.keys(runs)) {
    const names = readdirSync(join(dir, T)).filter((f) => new RegExp(`^${arm}\\.\\d+\\.json$`).test(f));
    assert.ok(names.length >= 3, `${arm}: fewer than three runs are recorded`);
    for (const n of names) {
      const base = n.replace(/\.json$/, '');
      const meta = JSON.parse(read(`${T}${n}`, `the ${base} record`));
      const prompt = read(`${T}${base}.prompt.txt`, `the ${base} prompt`);
      const raw = read(`${T}${base}.raw.txt`, `the ${base} raw output`);
      assert.equal(meta.keySha256, sha(keyText), `${base}: the key is not the one recorded`);
      assert.equal(meta.promptSha256, sha(prompt), `${base}: the prompt is not the one recorded`);
      assert.ok(meta.observer && meta.observer !== meta.author, `${base}: the observer is the author or unnamed`);
      assert.ok(meta.agent && meta.model && meta.date, `${base}: agent, model or date is not recorded`);
      assert.deepEqual(JSON.parse(raw).answers, meta.answers, `${base}: the answers are not the raw output unedited`);
      assert.ok(!prompt.includes('"finding":'), `${base}: the prompt carries the key`);
      for (const s of key) assert.ok(prompt.includes(s.statement), `${base}: the prompt lacks ${s.id}`);
      assert.ok(meta.answers.every((a) => 'next' in a), `${base}: the answers lack the next move`);
      runs[arm].push(meta);
    }
  }
  return { key, runs };
}
