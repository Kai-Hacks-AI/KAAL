// Case release/T1401 tests: release/C129
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const rec = (p) => readFileSync(new URL('../../04-controls/' + p, import.meta.url), 'utf8');
export const id = 'release/T1401';
export const tests = ['release/C129'];
export const title = 'the controls verify CodeQL analysis and verify CodeQL findings are two preventive records with their own Intents, no ratchet strategy and no ratchet registration';
export async function run() {
  const both = [['CTL34-verify-codeql-analysis/CTL34.md', 'release/CTL34', 'verify CodeQL analysis', 'release/I68'], ['CTL35-verify-codeql-findings/CTL35.md', 'release/CTL35', 'verify CodeQL findings', 'release/I69']];
  for (const [p, cid, title, intent] of both) {
    const t = rec(p); const head = t.split('---')[1];
    assert.match(head, new RegExp(`^id: ${cid}$`, 'm')); assert.match(head, new RegExp(`^title: ${title}$`, 'm'));
    assert.match(head, /^type: preventive$/m); assert.match(head, new RegExp(`^has: \\[${intent}\\]$`, 'm')); assert.match(head, /^evidence: /m);
    assert.doesNotMatch(t, /strategy:|:ratchet|baseline-source/);
  }
  const [analysis, findings] = both.map(([p]) => rec(p).split('---').slice(2).join('---'));
  assert.doesNotMatch(analysis, /alert:/);   // each names the other only to disclaim it, never as its own finding
  assert.doesNotMatch(findings, /`(missing|errored):/);
}
