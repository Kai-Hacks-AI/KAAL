# DO (retro/C1)

Delivered: `skills/kaal-retro/SKILL.md`, `skills/kaal-retro/references/4l.md` (with its Result section), `ownership.kaal.json` (provisional Learning claim, as approved), `package.json`, `README.md`, `LICENSE`, the trial accounting `plan/skill/trial.json` and the six trial records under `plan/skill/trial/`. The ten Cases moved from RED to green and are the package's `test` script. The package is not added to the root workspaces: wiring is a separate decision.

## Deterministic check

`node --test test/plan/retro.test.mjs` gives 10 pass, 0 fail. T1 to T6 read the written contract and package; T3 and T6 prove wording presence only. T7 to T9 challenge 4L records against the Result section of the reference. T10 checks that the trial accounting exists, keeps instruction and evidence lookups apart, and marks context figures. None of this shows an agent follows the Skill.

## Agent trial (nondeterministic)

Six runs, one per cell: three unlike subjects (an ongoing documentation rewrite, a one-off street party, a personal decision still open), each in two arms.

- Skill-only: an agent given the text of the two installed files, told not to look anything up about how to run a retrospective, and allowed one Write to save its record.
- Baseline, as today: an agent told to do it the way the repository does, looking up earlier retrospectives and PR templates to copy their shape.

An earlier attempt was void (the Skill text was not expanded in the prompt) and is not counted.

### Accounting (see trial.json)

| Subject | Arm | Instruction lookups | Evidence lookups | Tool calls | Context tokens |
| --- | --- | --- | --- | --- | --- |
| docs rewrite | Skill-only | 0 | 0 | 2 | 60,455 measured |
| docs rewrite | baseline | 2 | 0 | 6 | 61,402 measured |
| street party | Skill-only | 0 | 0 | 2 | 60,223 measured |
| street party | baseline | 2 | 0 | 6 | 61,243 measured |
| decision | Skill-only | 0 | 0 | 2 | 60,287 measured |
| decision | baseline | 5 | 0 | 5 | 62,635 measured |

Skill-only needed no instruction lookup and fewer tool calls in every pair. The context saving is small, about 1,000 to 2,400 tokens per run, because the Skill text itself is part of the prompt. It does not show a saving in a real install, where the Skill may be loaded differently, and the figures are one run per cell. Evidence lookups were not exercised: the subjects were given inline.

### Behavioral quality, apart from the checks

Reading the six records:

- All three Skill-only records stated method, subject, assumptions and participants, said whose views were missing, labeled entries, covered all four categories, and ended by deciding nothing. The baseline records followed the repository's shape: four headings of prose, no labels, no stated participants, no decisions statement. They are reasonable retrospectives but cannot distinguish observation from interpretation from proposal.
- Running the 4L record challenge over the six records (a test-only function, not part of the Skill): the decision Skill-only record raised no finding; the docs and street-party Skill-only records raised `unlabeled-entry`, because they appended an explanation to `None raised.` rather than writing it alone. All three baseline records raised six or five findings, which says only that they do not follow a shape the baseline was never given.
- The baseline arm is not a fair test of retrospective quality: it was asked to copy repository examples, which carry no 4L result expectations. The comparison supports the lookup accounting, not a claim that the Skill makes better retrospectives.
- Interpretation was sometimes entered where the evidence supports only an observation (the street-party record infers the food was under-planned from a run-out). The Skill's instruction to keep these apart was followed in form more than in judgment.

No pass is claimed. Three runs in the Skill-only arm are not enough to say how often the exact `None raised.` form holds; the Skill was not changed to make the challenge pass.
