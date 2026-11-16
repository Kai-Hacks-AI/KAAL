// The Show WIP command: read the open pieces of a repository through the host's command line the environment is signed in to, show where each one is.
// Usage: node run.mjs <owner/repo> <show-wip.json> [overview|<place>]
// Without a view it shows the open pieces only. `overview` adds the inventory as counts, a place name lists the branches of that place in full.
// Read-only: it only asks the host's API. A gateway failure is read again a few times. Exit 0 when a report was printed; 2 naming what could not be read.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { render, renderInventory, showWip } from '../../../../packages/kaal-release/skills/kaal-release/scripts/show-wip.mjs';
import { packageChanged, readBranches, readOpenPulls, readPackages, readTags } from './read.mjs';

const PAUSE_MS = Number(process.env.SHOW_WIP_PAUSE_MS ?? 2000);
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const gh = async (args) => {
  for (let attempt = 1; ; attempt++) {
    try {
      return JSON.parse(execFileSync('gh', ['api', ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] }));
    } catch (error) {
      if (attempt === 4) throw new Error(`gh api ${args[0]} failed ${attempt} times: ${String(error.stderr || error.message).trim().split('\n')[0]}`);
      await pause(PAUSE_MS * attempt);
    }
  }
};

const BRANCHES = 'query($owner:String!,$name:String!,$after:String){repository(owner:$owner,name:$name){refs(refPrefix:"refs/heads/",first:100,after:$after){pageInfo{hasNextPage endCursor} nodes{name}}}}';
const branchPage = async ([, repoName, after]) => {
  const [owner, name] = repoName.split('/');
  const args = ['graphql', '-f', `query=${BRANCHES}`, '-F', `owner=${owner}`, '-F', `name=${name}`];
  if (after !== 'after=') args.push('-F', after);
  const refs = (await gh(args)).data.repository.refs;
  return { nodes: refs.nodes, next: refs.pageInfo.hasNextPage ? refs.pageInfo.endCursor : null };
};
// npmjs is public: a package it does not know is never published (404); any other failure is not read.
const npm = async (name) => {
  const answer = await fetch(`https://registry.npmjs.org/${name.replace(/\//g, '%2F')}`);
  if (answer.status === 404) return null;
  if (!answer.ok) throw new Error(`npmjs answered ${answer.status}`);
  const body = await answer.json();
  return { versions: Object.keys(body.versions ?? {}), distTags: body['dist-tags'] ?? {} };
};
// The packages of the repository from packages/*/package.json, the release tags, and whether a package itself changed on main after a tag.
async function readPackageFacts(repoName, base) {
  const dirs = (await gh([`repos/${repoName}/contents/packages`])).filter((e) => e.type === 'dir').map((e) => e.name);
  const packages = [], dirOf = new Map();
  for (const dir of dirs) {
    const file = await gh([`repos/${repoName}/contents/packages/${dir}/package.json`]);
    const json = JSON.parse(Buffer.from(file.content, 'base64').toString('utf8'));
    packages.push({ name: json.name, version: json.version, private: Boolean(json.private) });
    dirOf.set(json.name, dir);
  }
  let tags, tagGaps = [];
  try { ({ tags, gaps: tagGaps } = await readTags(repoName, gh)); } catch { tags = undefined; }
  const changedSince = async (name, version) => packageChanged(await gh([`repos/${repoName}/compare/${encodeURIComponent(`${name}@${version}`)}...${base}`]), dirOf.get(name));
  const facts = await readPackages({ packages, tags, npm, changedSince });
  return { ...facts, gaps: [...tagGaps, ...facts.gaps] };
}

try {
  const [repoName, configFile, view] = process.argv.slice(2);
  if (!repoName || !configFile) throw new Error('could not start: expected <owner/repo> <show-wip.json> [overview|<place>]');
  const config = JSON.parse(readFileSync(configFile, 'utf8'));
  const { pieces, gaps } = await readOpenPulls(repoName, gh);
  if (view === undefined) process.stdout.write(render(showWip({ pieces, gaps }, config)));
  else {
    const { branches, gaps: branchGaps } = await readBranches(repoName, branchPage);
    const { packages, gaps: packageGaps } = await readPackageFacts(repoName, config.default ?? 'main');
    const report = showWip({ pieces, branches, packages, gaps: [...gaps, ...branchGaps, ...packageGaps] }, config);
    process.stdout.write(render(report) + '\n' + renderInventory(report, view === 'overview' ? {} : { place: view }));
  }
} catch (error) {
  console.error(`show WIP: ${error.message}`);
  process.exitCode = 2;
}
