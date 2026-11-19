# An installed kaal-testing stands alone: DO (testing/C66)

`testing/C66` is the DO of `testing/C65` (#2014, CPO approved, merged into the collector). The boundary stands: Testing observes and reports, and does not judge a count (kaal-change), enforce (Guard) or wire itself into a consumer's lanes.

## What it delivers

- Cases testing/T370 to T373 (renamed from `.red.mjs` to `.test.mjs` without a change of content, except as listed under "Differences from the PLAN"), run from `test/plan/standalone.test.mjs` and added to Testing's `npm test`. `run-red.mjs` is removed, since the wrapper replaces it.
- The trial: `plan/standalone/trial/` holds the protocol, the neutral prompt, the key, the fixture, the recorded runs (`runs/`, set 2) and the sets kept beside it (`sets/`).
- Name scrub in the shipped package, so the scan in T372 passes: `README.md`, `lib/report.mjs`, `lib/run.mjs` no longer name KAAL repository paths, other packages or outside roles.
- A pointer in `README.md` ("Run your tests") and in the Skill (`skills/kaal-testing/SKILL.md`, "Observing a run"). T160's section list now names the new Skill section.

## What the trial showed

Strangers get an empty folder, the packed package installed with its declared dependencies, three test files (2 GREEN, 1 RED, 3 UNKNOWN by the key) and a neutral prompt. A judge in a separate session scores the transcript against `trial/key.json`; a quote must be found in the transcript.

| Set | Arrangement | `kaal-testing run` used | K1 to K6 | K7 (dropped, see below) |
| --- | --- | --- | --- | --- |
| 1 | no pointer in the package | 1 of 3 (two used plain `node --test`) | met in 1 of 3 | not met |
| 2 | README and Skill pointer, no Skill deployed | 3 of 3 | met in 3 of 3 | not met in 3 |
| 3 | Skill listed in the prompt (simulated loading, a sub-agent cannot auto-load a project skill) | 3 of 3 | not judged | not judged |
| 4 | Skill deployed to `.claude/skills/kaal-testing/`, real headless `claude -p` sessions | 3 of 3, after the agent called the Skill tool first | met in 3 of 3 | met 1, unresolved 1, not met 1 |
| 6 | as set 4, with the "Observing a run" section reworded (from where to where, handed to the decider) | 3 of 3, Skill called first | met in 3 of 3 | met 1, not met 2 |

Set 2 is the recorded acceptance set in `runs/` (the PLAN's arrangement: bare install). Set 4 answers Kai's question whether a deployed Skill is picked up: it was, by location, in all three sessions. Set 3 is kept only as a labelled simulation and is not evidence of loading.

## K7 is dropped

K7 asked the agent to say a count is not a decision and leave the release to its owner. It is dropped from the key. The prompt is the agent's "in": it asks whether the customers can be told, and an agent that tries to fulfil a prompt answers it, so a Skill cannot fairly be tested on not deciding against a prompt that asks for a decision. Set 2 met it 0 of 3, set 4 once, and set 6 once, after the Skill section was reworded from a "don't" into where Testing starts and where it stops, with the decider named only as an abstract role. The recorded judgments still carry K7 verdicts as evidence; T373 reads only the key's items, so they are not required.

The reworded section stays, since it states Testing's scope by what it does and where it hands on. Set 5 (an intermediate wording) was run but not judged and is not recorded.

## Corrections after the CPO's second comment

- **Report partial evidence.** The example report said that for UNKNOWN or an incomplete run "no result is handed on yet" and that nothing goes to the decider until the run is complete. That made completion a condition for reporting, which is the consumer's call. The example and the Skill now hand on the truthful available evidence as it stands, partial or complete, with what is unobserved, and leave retry, investigation, risk or proceeding to the decider.
- **Installed command executability.** `bin/kaal-testing.mjs` was committed as 100644, unlike the bins of the other packages (100755), so the tarball held it as `-rw-r--r--`. `npm install` makes the linked command executable, which is why sets 2 and 4, installed with npm, ran `npx kaal-testing` and T370 ran the linked command. Sets 6 to 8 used a hand-made copy of the tarball content instead of an npm install, and in set 6 run 3 the command failed with "Permission denied" and the agent ran the file with Node. That fallback is not evidence that the command works; the cause was this defect, not only my copy. The file is now 100755, and T370 asserts the packed tarball lists the bin as executable (skipped on Windows, which has no exec bit). With the bin at 644, T370 is RED; at 755 it is GREEN.
- **Sets 6 to 8** are dry runs on hand-made copies and are not recorded as evidence of installation; set 6 is kept in `sets/` for the K7 argument only.

## Differences from the PLAN, disclosed

- The fixture `pending` became `service` (`throw new Error('service unreachable')`). A never-settling test hangs a Node 24 run until the whole-run timeout, where Node 22 cancels it at once, so it could not stand as a plain UNKNOWN case. The key's K4 follows.
- The pointer in the README and the Skill is wording outside the PLAN's scope. It answers set 1, where two of three strangers did not find `kaal-testing run`. I asked Kai on a decision card; this DO carries it as recommended.
- `repositoryReachable: false` means no repository is on the working folder's path (`git rev-parse` fails), not that the agent was technically prevented from reading elsewhere.
- Sets 2 and 3 transcripts are abridged from the agents' final reports (commands and excerpts as the agents reported them), not tool-level logs. Set 4 transcripts are tool-level from the headless session. Where two runs' K6 quote is only a read-only command log, the judge read "nothing edited" from absence of an edit.
- Node 24.22.1 is at `/opt/node24/bin`; the Cases and the trial ran on it. The default `node` in the sandbox is 22.

## Results

T370 to T373 pass on Node 24.22.1 with the registry reachable. A registry or npm failure is an Error (UNKNOWN), never RED (T371). In my sandbox the other Testing tests could not run, because the workspace dependencies are not built there; CI shows them.

## Boundaries retained (CPO comment on #2105)

- **What this trial shows.** An installed kaal-testing is discovered, runs given tests and reports GREEN, RED and UNKNOWN. It does not show better test design or testing quality. That is a separate Testing Change, with a quality-focused trial of its own.
- **Deployment and discovery are not Testing's.** Placing the Skill in `.claude/skills` changed agent behaviour (set 4 against set 2). That applies to every KAAL capability and belongs to package, WIRE and agent-discovery work. Testing ships the Skill and its references and takes no responsibility for installing or discovering them.
- **AGENTS.md and SKILL.md differ.** A package's AGENTS.md guides work on that package; the deployed SKILL.md and its references guide use of the capability, and a consumer's own AGENTS.md stays the consumer's. This DO changes SKILL.md, a reference and the README only.
- **Testing reports; consumers decide.** K7 was dropped because the prompt itself asks for a release decision, not to hide the outcome: in every set the agent kept the test observations apart from any authorisation to release (K5), and Testing makes no release decision.

## What it does not claim

The trial shows that the installed package explains itself to an agent. It does not show a baseline without any Skill or README (D2), a neutral claim-file format instead of `ownership.kaal.json` (D1), that test counts are not Case counts, or that RED 0 is not completion; these stay for later Changes. No promotion, activation or publication is claimed.
