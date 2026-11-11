// A6 check-job body: judges one pull request. Usage: node check.mjs --pr <pr.json> --tree <capability folder> [--evidence <evidence.json>]
// Exit codes follow Guard: 0 PASS, 1 FAIL, 2 UNKNOWN (cannot judge), 3 not applicable. UNKNOWN never passes.
import { existsSync, readFileSync } from 'node:fs';
import { judge } from './judge.mjs';
import { readEvidence } from './evidence.mjs';
import { readPullRequest, readTreeFromDisk } from './reader.mjs';

const args = process.argv.slice(2);
const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);

async function main() {
  let pr;
  try { pr = readPullRequest(JSON.parse(readFileSync(option('--pr'), 'utf8'))); } catch { pr = { unreadable: 'the pull request' }; }
  if (pr.unreadable) { console.log(`UNKNOWN: ${pr.unreadable} is unreadable. Make it readable and run verify Plan again.`); return 2; }
  if (!/^[a-z][a-z0-9-]*\/C\d+ PLAN: /.test(pr.title)) { console.log('Not applicable: the title is not <capability>/<C-ID> PLAN: <concern>.'); return 3; }
  const tree = option('--tree');
  if (tree === undefined || !existsSync(tree)) { console.log('UNKNOWN: the plan tree is unreadable. Provide the capability folder and run verify Plan again.'); return 2; }
  const evidenceFile = option('--evidence');
  let evidence;
  try { evidence = evidenceFile !== undefined && existsSync(evidenceFile) ? readEvidence(readFileSync(evidenceFile, 'utf8')) : undefined; } catch { evidence = undefined; }
  const result = await judge({ ...readTreeFromDisk(tree), evidence });
  console.log(`${result.verdict}`);
  for (const finding of result.findings) console.log(`  ${finding.status.toUpperCase()} ${finding.rule} ${finding.id}: ${finding.message}\n    Recovery: ${finding.recovery}`);
  return { PASS: 0, FAIL: 1, UNKNOWN: 2 }[result.verdict] ?? 2;
}

process.exitCode = await main();
