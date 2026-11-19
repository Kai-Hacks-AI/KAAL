# Trial protocol: kaal-testing used by a new consumer (testing/C65)

This is the judged half of testing/C65. Its first half is deterministic (T370 to T372: the package installs alone and its tools run). Only a reading of what an agent did can say whether the installed Skill and tools let a stranger do what they are for, so that part is judged, as C7 judged the controls Skill.

## What one run is

1. A fresh empty directory outside any repository. Node 24 or later. `npm pack` of the package under test is installed into it, with its declared dependencies. The fixture files of `trial/fixture/` are copied in, with `.fixture.mjs` renamed to `.test.mjs` (they are kept under the other name so that no test runner in this repository picks them up). Nothing else is there: no KAAL repository, no other KAAL package, no `engineering/` folder.
2. One agent, started with only that directory as its working folder, receives `prompt.txt` as its task and nothing else. It may read the installed Skill, `node_modules/kaal-testing/skills/kaal-testing/SKILL.md`, and use the installed command. It is not told which tool to use.
3. The full transcript is kept as `runs/run-<n>/transcript.md`.
4. Isolation is recorded for every run in `runs/run-<n>/isolation.json` (see `key.json`'s sibling `T373`): the Node version, the listing of the directory before the run, the installed KAAL-family packages, that no repository was reachable from the working folder, and the model and session of the agent.
5. A different agent session, the judge, reads the transcript against `key.json` and writes `runs/run-<n>/judgment.json`: for every key item `met`, `not met` or `unresolved`, with one quote from the transcript that supports it. A quote that is not in the transcript voids the judgment of that item. The judge never sees another run.

## Why the deterministic anchor

The key states the counts the installed command must report for the fixture (`expected`). T373 checks that the fixture yields exactly those counts with the installed package, so the judge reads against a known truth and the fixture cannot drift.

## Acceptance (declared before any run)

Three runs are a pilot, not a measurement: they show what three agents did once. Every item of level `must` is `met` in all three runs; items of level `should` are reported, never required; an item left `unresolved` counts as not met. One run with a `not met` must item is a finding to act on in the DO, then a fresh set of three runs, with the earlier set kept.

## What this does not show

That the Skill is good in general, that a different model would do the same, or that the key is right: the key is the PLAN's judgment, and the CPO judges it with the PLAN (`evidence.md`). No baseline without the Skill is run here (open decision D2).
