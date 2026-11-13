// Shared by the Cases of this Change. Review knows no subject: every Case runs over each application under applications/,
// whose own subject.json names its focus, its reference and its actual, what is inspected and the questions to answer.
// At least one application is required. The focuses promotion and capability are defined here; any other focus carries its own.
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
export const dir = join(dirname(fileURLToPath(import.meta.url)), '../..');
const A = join(dir, '00-changes/C1-focused-review/applications');
const rd = (p, what) => { assert.ok(existsSync(p), `${what} is absent`); return readFileSync(p, 'utf8'); };
export const FOCI = { promotion: ['what the promotion promised to change', 'what changed'], capability: ['the Intent of the capability', 'what the capability delivers'] };
export function applications() {
  assert.ok(existsSync(A), 'no application exists');
  const apps = readdirSync(A).filter((n) => statSync(join(A, n)).isDirectory());
  assert.ok(apps.length > 0, 'no application exists');
  return apps.map((name) => {
    const d = join(A, name);
    const subject = JSON.parse(rd(join(d, 'subject.json'), `${name}: subject.json`));
    const f = subject.focus;
    assert.ok(f, `${name}: subject.json states no focus`);
    for (const side of ['reference', 'actual']) {
      const x = subject[side];
      assert.ok(x && x.label && x.reads, `${name}: the ${side} is not given as a label and what is read`);
    }
    if (!(f in FOCI)) assert.ok(subject.reference.provided && subject.actual.provided, `${name}: the focus ${f} is not defined by Review, so its reference and actual must be provided`);
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
// Each finding of the Comparison is marked Proven (citing test evidence and its result), Judged (saying why it can only be judged)
// or Testable, not tested (named for Testing). A review runs no test of its own.
export function findings(app) {
  const c = section(app, 'Comparison');
  const f = c.split('\n').filter((l) => /^\s*[-*] /.test(l));
  assert.ok(f.length > 0, `${app.name}: no findings are listed`);
  return f;
}
export const each = (fn) => { for (const app of applications()) fn(app); };
