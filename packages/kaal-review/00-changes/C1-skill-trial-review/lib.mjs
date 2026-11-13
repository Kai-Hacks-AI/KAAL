// Shared by the Cases of this Change. Review knows no subject: every Case runs over each application under applications/,
// whose own subject.json names what is inspected and the questions to answer. At least one application is required.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
export const dir = join(dirname(fileURLToPath(import.meta.url)), '../..');
const A = join(dir, '00-changes/C1-skill-trial-review/applications');
const sha = (s) => createHash('sha256').update(s).digest('hex');
const rd = (p, what) => { assert.ok(existsSync(p), `${what} is absent`); return readFileSync(p, 'utf8'); };
export function applications() {
  assert.ok(existsSync(A), 'no application exists');
  const apps = readdirSync(A).filter((n) => statSync(join(A, n)).isDirectory());
  assert.ok(apps.length > 0, 'no application exists');
  return apps.map((name) => {
    const d = join(A, name);
    const subject = JSON.parse(rd(join(d, 'subject.json'), `${name}: subject.json`));
    assert.ok(Array.isArray(subject.inspected) && subject.inspected.length > 0, `${name}: subject.json lists nothing inspected`);
    assert.ok(Array.isArray(subject.questions) && subject.questions.length > 0, `${name}: subject.json lists no questions`);
    return { name, d, subject, review: () => rd(join(d, 'review.md'), `${name}: the review record`) };
  });
}
export function section(app, name) {
  const m = app.review().match(new RegExp(`^## ${name}\\s*$([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, 'm'));
  assert.ok(m && m[1].trim().length > 0, `${app.name}: the review record has no chapter "${name}" or it is empty`);
  return m[1];
}
// A reviewer trial is valid with provenance: a key of the reviewer fixed before the runs, its hash in every record,
// statements none of which is the author's, a prompt that holds the statements and nothing of the key, raw output equal
// to the recorded answers, an observer who is not the author, and at least three runs per arm.
export function trial(app) {
  const T = join(app.d, 'trial');
  const keyText = rd(join(T, 'key.json'), `${app.name}: the reviewer key`);
  const key = JSON.parse(keyText).scenarios;
  const author = JSON.parse(rd(join(T, 'author-statements.json'), `${app.name}: the snapshot of the author statements`)).statements;
  for (const s of key) assert.ok(!author.includes(s.statement), `${app.name} ${s.id}: the statement is the author's`);
  assert.ok(key.length >= 8, `${app.name}: the reviewer key holds fewer than eight statements`);
  const runs = { skill: [], baseline: [] };
  for (const arm of Object.keys(runs)) {
    const names = readdirSync(T).filter((f) => new RegExp(`^${arm}\\.\\d+\\.json$`).test(f));
    assert.ok(names.length >= 3, `${app.name} ${arm}: fewer than three runs are recorded`);
    for (const n of names) {
      const base = n.replace(/\.json$/, '');
      const meta = JSON.parse(rd(join(T, n), `${base} record`));
      const prompt = rd(join(T, `${base}.prompt.txt`), `${base} prompt`);
      const raw = rd(join(T, `${base}.raw.txt`), `${base} raw output`);
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
export const each = (fn) => { for (const app of applications()) fn(app); };
