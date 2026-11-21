---
id: testing/RT2
format: 4L
reflects: [testing/C78, testing/C79]
---
Account of: I am the Testing agent who planned `testing/C78` (`#2252`) and executed `testing/C79` (`#2256`) on collector `kaal/testing/act-library-sensitivity`, running the mutation pilot on release's ACT library, and who wrote this retrospective; Kai and the CPO gave the go and the approvals, release triaged the survivors, and this is my own account.

## Liked
- subject: registering the claims K1–K8 in the PLAN before the pilot ran
  keeps: the pilot could not pick its own claims afterwards, so a surviving mutant (M12, M21) stayed a finding about a named claim and the CPO could judge the table against what was promised; without it the four survivors would have read as chosen.
- subject: the load trace in each mutant file (a one-line prelude that appends when the module loads)
  keeps: every kill and every survivor is known to have run against the mutant, so M20, M21, M23 and M12 surviving means "the Cases did not notice", not "the swap never happened".
- subject: running the three justified Cases against the unmutated tree and their mutant before handing them over
  keeps: release received J1 to J3 as text that is known to pass and known to fail for the named reason, so landing them in C125 is a copy, not a rediscovery.

## Learned
- subject: equivalent mutants cannot be told from missing assertions by a runner; only a reading of the code and its contract can
  source: no new search in this collector; the mutation-testing literature read for `testing/RT1` (DeMillo, Lipton and Sayward; Jia and Harman, secondhand through web-search summaries) applied again, and confirmed here by M20, whose `&& !c.parked` is redundant because the parked branch is tested first.
- subject: an answer built as an object literal escapes the module that enforces the answer's shape
  source: release's own `lib/result.mjs` and `F88` read in the tree at the pin; `casesAreGreen` and `judgeAct` do not import the module, so the refusal F88 states cannot fire (M21).

## Lacked
- subject: a rule for when an exception under a mutant counts as the mutant's own
  decision-point: classifying M16, where the library threw `id.includes is not a function` on the mutated line and the Case failed by crash, not by assertion; the PLAN said unrelated errors are kept apart but not how to tell them from related ones.
  cost: one ruling by hand, with the baseline GREEN and the line of the throw as the evidence, and a method note in `pilot.md`; the runner had marked it `unresolved`.
  findable: yes
  address: Skill
- subject: the table format of the planned Cases cannot hold a pipe in a cell
  decision-point: writing the mutation column of `pilot.md`, where M10's `||` split a row into seven cells and `T395` failed with `7 !== 5`.
  cost: one failed run and a substitute character (`‖`) with a note in the record.
  findable: yes
  address: script
- subject: whether release's promotion #2243 was on `main`
  decision-point: choosing the SHA to pin, after the coordinator said #2243 had merged and release said it had not.
  cost: a check of the tree and the pull request before pinning; no wrong pin followed.
  findable: yes
  address: AGENTS.md
- subject: Node 24 in the sandbox
  decision-point: running the package suite before opening `#2256`, where `T369` needs Node 24 and the sandbox has 22.23.
  cost: 106 of 107 pass locally and the full suite green rests on the pull request's checks.
  findable: no
  address: AGENTS.md

## Longed For
- subject: a re-run of the same twenty-three mutants on the SHA where `release/C125` has landed
  worked-anyway: `pilot.md` names C125 as pending and claims nothing about `judgeHold` or `applicableCases` as C125 will change them, which the CPO's approval accepted.
- subject: Testing's own runner swapping a file for its mutant, instead of a scratch driver
  worked-anyway: one fresh Node process per release Case, with each Case's own `run()`, gave the same attribution (Case and line) and the record says the driver is not committed, as N38 requires.

Decisions: none made, the owner decides.
