// A6 check-job body: judges one pull request. Usage: node check.mjs --pr <pr.json> --repo <repository root> [--execute | --evidence <evidence.json>]
// The capability folder is found from the Change the title names (its 00-changes/<C-ID>-<slug>/<C-ID>.md), so every capability is judged. With --execute the Cases of that folder are executed first.
// This is the GitHub adapter: it identifies the PLAN the pull request names and hands the judge only that PLAN and its evidence. The judge knows no pull request.
// Exit codes follow Guard: 0 PASS, 1 FAIL, 2 UNKNOWN (cannot judge), 3 not applicable. UNKNOWN never passes.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { judge } from './judge.mjs';
import { readEvidence } from './evidence.mjs';
import { readPullRequest, readTreeFromDisk } from './reader.mjs';

const args = process.argv.slice(2);
const here = dirname(fileURLToPath(import.meta.url));
const option = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);

// Every folder that holds the Change: <folder>/00-changes/<C-ID>-<slug>/<C-ID>.md with that id in its front matter.
function foldersHolding(repo, changeId) {
  const found = [];
  const [, number] = /\/C(\d+)$/.exec(changeId);
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === '.git' || entry.name === 'node_modules') continue;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) { walk(path); continue; }
      const parts = path.split(sep);
      if (entry.name !== `C${number}.md` || !/^C\d+-/.test(parts.at(-2)) || parts.at(-3) !== '00-changes') continue;
      if (new RegExp(`^id:\\s*${changeId}\\s*$`, 'm').test(/^---\n([\s\S]*?)\n---/.exec(readFileSync(path, 'utf8'))?.[1] ?? '')) found.push(parts.slice(0, -3).join(sep));
    }
  };
  walk(repo);
  return found;
}

async function main() {
  let pr;
  try { pr = readPullRequest(JSON.parse(readFileSync(option('--pr'), 'utf8'))); } catch { pr = { unreadable: 'the pull request' }; }
  if (pr.unreadable) { console.log(`UNKNOWN: ${pr.unreadable} is unreadable. Make it readable and run verify Plan again.`); return 2; }
  if (!/^[a-z][a-z0-9-]*\/C\d+ PLAN: /.test(pr.title)) { console.log('Not applicable: the title is not <capability>/<C-ID> PLAN: <concern>.'); return 3; }
  const unknown = (why, recovery) => { console.log(`UNKNOWN: ${why}\n    Recovery: ${recovery}`); return 2; };
  const changeId = /^([a-z][a-z0-9-]*\/C\d+) PLAN: /.exec(pr.title)[1];
  const repo = option('--repo');
  let folders;
  try { folders = repo !== undefined && statSync(repo).isDirectory() ? foldersHolding(repo, changeId) : undefined; } catch { folders = undefined; }
  if (folders === undefined) return unknown('the repository is unreadable', 'Provide the repository root and run verify Plan again.');
  if (folders.length !== 1) return unknown(`${folders.length === 0 ? 'no capability folder holds' : 'more than one capability folder holds'} the Change ${changeId} that the pull request names`, `Give ${changeId} exactly one 00-changes/<C-ID>-<slug>/ folder, or correct the pull request title.`);
  const tree = folders[0];
  const scope = `${relative(repo, tree).split(sep).join('/')}/`;
  const outside = pr.files.find((file) => typeof file.filename !== 'string' || !file.filename.startsWith(scope));
  if (outside !== undefined) return unknown(`the pull request changes ${outside.filename}, outside ${scope}`, 'Split the pull request so a PLAN changes only its own capability folder, then run verify Plan again.');
  const exactlyOne = (commit) => { const ids = [...String(commit.message).matchAll(/^Driven-by:\s*(\S+)\s*$/gm)].map((match) => match[1]); return ids.length === 1 && ids[0] === changeId; };
  // A merge commit brings changes that were admitted elsewhere, and Branching judges it, so it carries no trailer of its own.
  const own = pr.commits.filter((commit) => !(Array.isArray(commit.parents) && commit.parents.length > 1));
  const untagged = own.find((commit) => !exactlyOne(commit));
  if (own.length === 0 || untagged !== undefined) return unknown(`${untagged === undefined ? 'the pull request has no commits' : `commit ${untagged.sha}`} does not carry exactly one Driven-by: ${changeId}`, `Give every commit exactly one trailer Driven-by: ${changeId}, then run verify Plan again.`);
  let evidenceFile = option('--evidence');
  if (args.includes('--execute')) {
    evidenceFile = join(mkdtempSync(join(tmpdir(), 'verify-plan-')), 'evidence.json');
    spawnSync('node', [join(here, '../../00-changes/C1-verify-plan/run-red.mjs'), '--root', tree, '--evidence', evidenceFile], { encoding: 'utf8' });
  }
  let evidence;
  try { evidence = evidenceFile !== undefined && existsSync(evidenceFile) ? readEvidence(readFileSync(evidenceFile, 'utf8')) : undefined; } catch { evidence = undefined; }
  const planModel = readTreeFromDisk(tree);
  const result = await judge({ ...planModel, evidence });
  console.log(`${result.verdict}`);
  for (const finding of result.findings) console.log(`  ${finding.status.toUpperCase()} ${finding.rule} ${finding.id}: ${finding.message}\n    Recovery: ${finding.recovery}`);
  return { PASS: 0, FAIL: 1, UNKNOWN: 2 }[result.verdict] ?? 2;
}

process.exitCode = await main();
