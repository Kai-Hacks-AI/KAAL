// A6 check-job body: judges one pull request. Usage: node check.mjs --pr <pr.json> --tree <capability folder> --scope <repository path of that folder, ending in /> [--evidence <evidence.json>]
// This is the GitHub adapter: it identifies the PLAN the pull request names and hands the judge only that PLAN and its evidence. The judge knows no pull request.
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
  const unknown = (why, recovery) => { console.log(`UNKNOWN: ${why}\n    Recovery: ${recovery}`); return 2; };
  const changeId = /^([a-z][a-z0-9-]*\/C\d+) PLAN: /.exec(pr.title)[1];
  const scope = option('--scope');
  if (scope === undefined) return unknown('the capability folder of the pull request is not given', 'Run verify Plan with the repository path of the capability folder.');
  const outside = pr.files.find((file) => typeof file.filename !== 'string' || !file.filename.startsWith(scope));
  if (outside !== undefined) return unknown(`the pull request changes ${outside.filename}, outside ${scope}`, 'Split the pull request so a PLAN changes only its own capability folder, then run verify Plan again.');
  const exactlyOne = (commit) => { const ids = [...String(commit.message).matchAll(/^Driven-by:\s*(\S+)\s*$/gm)].map((match) => match[1]); return ids.length === 1 && ids[0] === changeId; };
  const untagged = pr.commits.find((commit) => !exactlyOne(commit));
  if (pr.commits.length === 0 || untagged !== undefined) return unknown(`${untagged === undefined ? 'the pull request has no commits' : `commit ${untagged.sha}`} does not carry exactly one Driven-by: ${changeId}`, `Give every commit exactly one trailer Driven-by: ${changeId}, then run verify Plan again.`);
  const evidenceFile = option('--evidence');
  let evidence;
  try { evidence = evidenceFile !== undefined && existsSync(evidenceFile) ? readEvidence(readFileSync(evidenceFile, 'utf8')) : undefined; } catch { evidence = undefined; }
  const planModel = readTreeFromDisk(tree);
  if (!planModel.unreadable && !(planModel.changes ?? []).some((change) => change.id === changeId)) return unknown(`the plan tree holds no Change ${changeId}, which the pull request names`, `Point verify Plan at the capability folder that holds ${changeId}, or correct the pull request title.`);
  const result = await judge({ ...planModel, evidence });
  console.log(`${result.verdict}`);
  for (const finding of result.findings) console.log(`  ${finding.status.toUpperCase()} ${finding.rule} ${finding.id}: ${finding.message}\n    Recovery: ${finding.recovery}`);
  return { PASS: 0, FAIL: 1, UNKNOWN: 2 }[result.verdict] ?? 2;
}

process.exitCode = await main();
