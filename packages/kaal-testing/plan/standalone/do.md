# An installed kaal-testing stands alone: DO (testing/C66)

`testing/C66` is the DO of `testing/C65` (#2014, CPO approved, merged into the collector). The boundary stands: Testing observes and reports, and does not judge a count (kaal-change), enforce (Guard) or wire itself into a consumer's lanes.

## What it delivers

- Cases testing/T370 to T373 (renamed from `.red.mjs` to `.test.mjs` without a change of content, except as listed under "Differences from the PLAN"), run from `test/plan/standalone.test.mjs` and added to Testing's `npm test`. `run-red.mjs` is removed, since the wrapper replaces it.
- The trial: `plan/standalone/trial/` holds the protocol, the neutral prompt, the key, the fixture, the recorded runs (`runs/`, set 2) and the sets kept beside it (`sets/`).
- Name scrub in the shipped package, so the scan in T372 passes: `README.md`, `lib/report.mjs`, `lib/run.mjs` no longer name KAAL repository paths, other packages or outside roles.
- A pointer in `README.md` ("Run your tests") and in the Skill (`skills/kaal-testing/SKILL.md`, "Observing a run"). T160's section list now names the new Skill section.

## What the trial showed

Strangers get an empty folder, the packed package installed with its declared dependencies, three test files (2 GREEN, 1 RED, 3 UNKNOWN by the key) and a neutral prompt. A judge in a separate session scores the transcript against `trial/key.json`; a quote must be found in the transcript.

| Set | Arrangement | `kaal-testing run` used | K1 to K6 | K7 (a count is not a decision, `should`) |
| --- | --- | --- | --- | --- |
| 1 | no pointer in the package | 1 of 3 (two used plain `node --test`) | met in 1 of 3 | not met |
| 2 | README and Skill pointer, no Skill deployed | 3 of 3 | met in 3 of 3 | not met in 3 |
| 3 | Skill listed in the prompt (simulated loading, a sub-agent cannot auto-load a project skill) | 3 of 3 | not judged | not judged |
| 4 | Skill deployed to `.claude/skills/kaal-testing/`, real headless `claude -p` sessions | 3 of 3, after the agent called the Skill tool first | met in 3 of 3 | met 1, unresolved 1, not met 1 |

Set 2 is the recorded acceptance set in `runs/` (the PLAN's arrangement: bare install). Set 4 answers Kai's question whether a deployed Skill is picked up: it was, by location, in all three sessions. Set 3 is kept only as a labelled simulation and is not evidence of loading.

## Differences from the PLAN, disclosed

- The fixture `pending` became `service` (`throw new Error('service unreachable')`). A never-settling test hangs a Node 24 run until the whole-run timeout, where Node 22 cancels it at once, so it could not stand as a plain UNKNOWN case. The key's K4 follows.
- The pointer in the README and the Skill is wording outside the PLAN's scope. It answers set 1, where two of three strangers did not find `kaal-testing run`. I asked Kai on a decision card; this DO carries it as recommended.
- `repositoryReachable: false` means no repository is on the working folder's path (`git rev-parse` fails), not that the agent was technically prevented from reading elsewhere.
- Sets 2 and 3 transcripts are abridged from the agents' final reports (commands and excerpts as the agents reported them), not tool-level logs. Set 4 transcripts are tool-level from the headless session. Where two runs' K6 quote is only a read-only command log, the judge read "nothing edited" from absence of an edit.
- Node 24.22.1 is at `/opt/node24/bin`; the Cases and the trial ran on it. The default `node` in the sandbox is 22.

## Results

T370 to T373 pass on Node 24.22.1 with the registry reachable. A registry or npm failure is an Error (UNKNOWN), never RED (T371). In my sandbox the other Testing tests could not run, because the workspace dependencies are not built there; CI shows them.

## What it does not claim

The trial shows that the installed package explains itself to an agent. It does not show a baseline without any Skill or README (D2), a neutral claim-file format instead of `ownership.kaal.json` (D1), that test counts are not Case counts, or that RED 0 is not completion; these stay for later Changes. No promotion, activation or publication is claimed.
