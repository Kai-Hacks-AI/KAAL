// Entry of change/CTL2 identify Conflict: reads the facts, runs the judge through the controls adapter, prints the verdict.
//   node run-identify-conflict.mjs <facts.json>
// facts.json: { changes, resolved }, `changes` as { identity, text, claimed } and `resolved` as { path, before, after }.
// Environment (optional): KAAL_RUN_ID and KAAL_MERGE_SHA, kept in the run's log line. The control is detective: it never exits non-zero for a verdict.
import { readFileSync } from 'node:fs';
import { sha256 } from '@kaihacksai/kaal-foundation/sha256';
import { runControl } from '../../../kaal-controls/skills/kaal-controls/scripts/adapter.mjs';
import { identifyConflict } from '../../lib/identify-conflict.mjs';

const pinOf = (text) => sha256(Buffer.from(text, 'utf8'));
const read = (path) => { try { return JSON.parse(readFileSync(path, 'utf8')); } catch { return {}; } };

let judged;
const result = await runControl({
  id: 'change/CTL2',
  mode: 'detective',
  input: { pinOf, ...read(process.argv[2]) },
  boundary: { run: process.env.KAAL_RUN_ID, sha: process.env.KAAL_MERGE_SHA },
  check: (input) => {
    judged = identifyConflict(input);
    if (judged.kind === 'unknown') throw new Error(judged.note);
    return judged.kind === 'pass' ? [] : [...new Set(judged.findings.filter((f) => f.kind === 'conflict').map((f) => `conflict: ${f.path} ${f.changes.join(' ')}`))];
  },
});
console.log(JSON.stringify({ verdict: result.verdict, log: result.log, findings: judged?.findings ?? [] }));
