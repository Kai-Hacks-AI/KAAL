// The summary of the evidence of the ACT judges (release/C127), over a ledger kept with a control.
//   node summarize-act-evidence.mjs <ledger.jsonl> <hold|demand|verify|limit>
// It reads the ledger file and prints the summary of one judge: the counts, whether the trigger is reached, the boundaries exercised, what is unresolved and the last review.
// It decides nothing and changes nothing: readiness is a review entry of a person, advisory is the Owner's go.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { summarizeEvidence, reportOfSummary } from './lib/evidence.mjs';

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [file, judge] = process.argv.slice(2);
  if (!file || !judge) { console.error('usage: summarize-act-evidence.mjs <ledger.jsonl> <judge>'); process.exit(2); }
  const ledger = readFileSync(file, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
  console.log(reportOfSummary(summarizeEvidence(ledger, judge)));
}
