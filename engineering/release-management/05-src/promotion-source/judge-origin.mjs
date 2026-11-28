// verify Promotion Source: origin (release/CTL40, release/C159): a pull request into the default branch comes from a `kaal/<capability>/*`, `hotfix/*` or `wire/*` branch of this repository.
//   node judge-origin.mjs --base-ref <name>      (KAAL_REPO, KAAL_DEFAULT, KAAL_HEAD_REPO, KAAL_HEAD_REF: the facts of the job)
// The rule is `promotionOrigin` of engineering/github/lineage.ts, run through the controls adapter in detective mode: it reports and gates nothing.
// The verdict is PASS, REPORT (any other head repository or ref, a fork among them), UNKNOWN (a fact cannot be read; never a pass) or not applicable (the base is not the default branch). The facts are the event's refs alone: no permission beyond `contents: read`.
import { fileURLToPath } from 'node:url';
import { promotionOrigin } from '../../../github/lineage.ts';
import { runControl } from '../../../../packages/kaal-controls/skills/kaal-controls/scripts/adapter.mjs';
import { checking, report } from '../lineage/lib/answer.mjs';
import { run } from './lib/run.mjs';
import { DETECTIVE } from '../lib/entry-flag.mjs';

const ID = 'release/CTL40';

export async function check(facts, { mode = DETECTIVE, boundary } = {}) {
  const seen = {};
  return report(await runControl({ id: ID, mode, check: checking(promotionOrigin, seen), input: facts, boundary }), seen);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exit(await run({ label: 'Promotion Source: origin', id: ID, check, read: ({ repo, defaultBranch, baseRef, headRepo, headRef }) => ({ repo, defaultBranch, baseRef, headRepo, headRef }) }));
}
