// The Pull Promotion command: read the file state of the declared collectors of a repository from the host, say which have fulfilled their PDCA.
// Usage: node run.mjs <owner/repo> <declaration.json>
// Read-only and run by hand: it only asks the host's API with GET and is named by no hook, workflow or scheduled job.
// Credential: GH_TOKEN or GITHUB_TOKEN, or an already signed-in gh. Exit 0 when a result was printed; 2 naming what could not be read.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { walkCollectors } from '../../../../packages/kaal-release/skills/kaal-release/scripts/pull-promotion.mjs';
import { readFacts } from './read.mjs';

const PAUSE_MS = Number(process.env.PULL_PROMOTION_PAUSE_MS ?? 2000);
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const run = (args) => execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });

function requireCredential() {
  if (process.env.GH_TOKEN || process.env.GITHUB_TOKEN) return;
  try { run(['auth', 'status']); } catch {
    throw new Error('no credential: set GH_TOKEN or GITHUB_TOKEN to a read-only token, or sign in with gh auth login');
  }
}

// A gateway failure is read again a few times; a missing branch (HTTP 404) is the host's answer and is not retried.
const request = async (path, parse) => {
  for (let attempt = 1; ; attempt++) {
    try { return parse(run(['api', '-X', 'GET', path])); } catch (error) {
      const text = String(error.stderr || error.message).trim().split('\n')[0];
      if (/HTTP 404/.test(text) || attempt === 4) throw new Error(`could not read ${path.split('?')[0]}: ${text}`);
      await pause(PAUSE_MS * attempt);
    }
  }
};
const get = (path) => request(path, JSON.parse);
const getText = (path) => request(path, (text) => text);

try {
  const [repoName, declarationFile] = process.argv.slice(2);
  if (!repoName || !declarationFile) throw new Error('could not start: expected <owner/repo> <declaration.json>');
  let declaration;
  try { declaration = JSON.parse(readFileSync(declarationFile, 'utf8')); } catch (error) { throw new Error(`could not read ${declarationFile}: ${error.message}`); }
  requireCredential();
  const facts = await readFacts(repoName, declaration, get, getText, (message) => console.error(`pull Promotion: ${message}`));
  process.stdout.write(`${JSON.stringify(walkCollectors(facts, declaration), null, 2)}\n`);
} catch (error) {
  console.error(`pull Promotion: ${error.message}`);
  process.exitCode = 2;
}
