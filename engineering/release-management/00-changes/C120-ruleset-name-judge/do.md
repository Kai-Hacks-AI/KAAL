# C120 do

The DO changes `05-src/stages/stages.json` and `05-src/stages/judge.mjs` as the PLAN decides, and adds the Cases T1346 to T1349 (plain `.test.mjs`, in this Change's folder, sharing the helper of release/C35).

- `stages.json` declares `ruleset` on Integrating, on its parts Collecting, Hotfixing and Wiring, on Promoting and on Publishing, at the names the sources have today (`integrating`, `collecting`, `hotfixing`, `wiring`, `promoting`, `publishing`). Developing has no ruleset.
- `judge.mjs` compares each source's `name` with the name its stage declares and holds no name in code. A stage that declares no name, an empty one or a value that is not a string is a finding that names the stage: the judge fails closed. Nothing else it decides changed.
- Nothing is renamed and no ruleset source, `.github` file or ruleset in force is touched. The C106 DO changes the declared names to the numbered ones and renames the sources in one pull request, once this Change is on `main`.

## Verified

T1346 to T1349 pass; T481, T487 and T862 and the other Cases of the judge still pass, because the names did not change. `node --test engineering/cases/cases.test.mjs`: see the pull request; the known failures are unchanged. The ids T1346 to T1349 were free on every remote branch when taken; the C106 DO takes its own.
