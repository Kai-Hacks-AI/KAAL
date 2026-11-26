// verify Workflow names (release/CTL36, Intent release/I70): can the workflows be told apart by their display name?
//   node judge-workflow-names.mjs --head <folder> --out <findings.json>
// It writes the findings as a JSON list of names and no verdict, and exits 0 even when the list is not empty: the verdict is kaal-controls' `judge-mode`.
// It exits 2 and writes no file when it cannot tell (no `.github/workflows` in the folder, an unreadable file, a name that is not plain text), which `judge-mode` reads as UNKNOWN.
import { rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { runControl } from '../../../../packages/kaal-controls/skills/kaal-controls/scripts/adapter.mjs';
import { workflowNamesFindings } from './lib/names.mjs';
import { readWorkflows } from './lib/read.mjs';

// release/C154: the pure judge runs through the adapter in detective mode (controls/C141). The reads and the writing stay outside the check, so a throw of the check is UNKNOWN.
export async function run({ head, out }) {
  rmSync(out, { force: true });
  try {
    const workflows = readWorkflows(head);
    const answer = await runControl({ id: 'release/CTL36', mode: 'detective', check: ({ workflows: w }) => workflowNamesFindings(w), input: { workflows } });
    if (answer.verdict === 'UNKNOWN') throw new Error('the workflow names could not be judged');
    writeFileSync(out, JSON.stringify(answer.findings ?? []));
    return { code: 0 };
  } catch (e) { rmSync(out, { force: true }); return { code: 2, reason: e.message }; }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const at = (k) => { const i = process.argv.indexOf(k); return i < 0 ? undefined : process.argv[i + 1]; };
  const head = at('--head'); const out = at('--out');
  const r = head && out ? await run({ head, out }) : { code: 2, reason: 'usage: --head <folder> --out <findings.json>' };
  if (r.reason) console.error(`UNKNOWN: ${r.reason}`);
  process.exit(r.code);
}
