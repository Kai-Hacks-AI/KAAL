// The Show WIP command: read the open pieces of a repository through the host's command line the environment is signed in to, show where each one is.
// Usage: node run.mjs <owner/repo> <show-wip.json>
// Read-only: it only asks the host's API. A gateway failure is read again a few times. Exit 0 when a report was printed; 2 naming what could not be read.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { render, showWip } from '../../../../packages/kaal-release/skills/kaal-release/scripts/show-wip.mjs';
import { readOpenPulls } from './read.mjs';

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

try {
  const [repoName, configFile] = process.argv.slice(2);
  if (!repoName || !configFile) throw new Error('could not start: expected <owner/repo> <show-wip.json>');
  const config = JSON.parse(readFileSync(configFile, 'utf8'));
  const { pieces, gaps } = await readOpenPulls(repoName, gh);
  process.stdout.write(render(showWip({ pieces, gaps }, config)));
} catch (error) {
  console.error(`show WIP: ${error.message}`);
  process.exitCode = 2;
}
