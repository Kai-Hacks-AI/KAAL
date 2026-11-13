# C1 do

What the DO delivered, and what was observed.

## Delivered

- Two applications under `applications/`, each with its `subject.json` and a record `review.md` written by the chapters of A1: the focus capability on Architecture's Skill (Intent I1 against the Skill and trial of Architecture DO #1534 at bf42468), and the focus promotion on #1536 (what its body promised against its 38 changed files at 7af0687).
- The Cases T21 to T29 renamed from `.red.mjs` to `.test.mjs`, all green, and a runner `test/cases.test.mjs` added to the package's `test` script.

## Observed

- The capability review records, with its marks, that T3 is red on S4 as the recorded trial shows, and that the trial prompt asked for parts and finding only while the Skill's report includes the next move. Whether a run that asks for the next move answers ask is marked Testable, not tested, and nothing was run by this review.
- The promotion review found one thing the body does not say: C21 changed a delivered Case (T161). No path leaves the declared folders, which no Case asserts, so that finding is marked Testable, not tested.
- The Cases fail when a finding carries two marks, a Proven finding cites no Case id or trial path, or a finding names no item of the reference or the actual (each tried on a copy of the record and restored).

## Changed from the PLAN, as the CPO asked

- T28 no longer uses a length of 1,000 characters. It now needs both directions of the comparison to hold findings, every finding of Promised, not delivered to name an item of the reference, every finding of Delivered, not promised to name an item of the actual, and the comparison as a whole to touch both. `subject.json` therefore also lists the `items` of the reference and of the actual. This changes one delivered Case and the shape of `subject.json`; nothing else of the PLAN moved.

## Limits

- The reviewer is the Agent that wrote the PLAN. The records were written by that Agent and judged by it, with no human or other Agent between. The Cases check the shape and the evidence cited, not the soundness of the judgement.
- The capability application relies on the author's record of the Cases T1, T2, T5 to T8, which were not re-run.

## Not done

- No trial and no test is run. Nothing is deployed, published or promoted, and the packaging question (`kaal-testing` as a devDependency of the existing test) is left to the owners of the boundary.
