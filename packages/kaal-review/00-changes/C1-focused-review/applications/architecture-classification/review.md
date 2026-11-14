# Review: the capability architecture/I1, against what Architecture DO #1534 delivers

## Focus

capability: the Intent of the capability is compared with what it delivers. The application is the Skill `kaal-architecture` and its recorded trial.

## Reference

architecture/I1 and F1 to F3, N1 at bfee577 (the PLAN, with F3 and the key as amended in the DO at bf42468). I1: an agent classifies every statement about the target state of a plateau as Solution or Delivery before design proceeds, from one concise Skill independent of any organization, domain or technology. F3: split mixed statements, keep a constraint with the concern it constrains, ask where context or authority is insufficient.

## Actual

The kaal-architecture Skill and its recorded trial, Architecture DO #1534 at bf42468: `skills/kaal-architecture/SKILL.md` (52 lines), the key `scenarios.json` (ten statements), three trial runs of a Skill-only agent and of a baseline without the Skill (`trial/`, `trial/run1`, `trial/run2`), and the Cases T1 to T8 with T3 red.

## Comparison

Marks. Proven: a Case or recorded trial shows it, cited by id or path with its result, and not repeated here. Judged: only judgement can settle it, and the reasoning is given. Testable, not tested: a test could show it and none exists, and the finding says what a test would have to show.

### Promised, not delivered

- Proven. F3 promises that an agent asks where it cannot tell. The recorded Skill-only answer for S4 in `trial/skill.json` (run 3) is delivery with finding none, and the key says ambiguous, so Case T3 is red on S4. Checked: `trial/skill.json` answer S4 against `scenarios.json` S4, and `do.md`.
- Judged. Whether that red is a miss by the Skill is not settled by the Case. Checked: `trial/skill.prompt.txt` holds the Skill, whose report asks for parts, finding and the next move keep, split or ask (SKILL.md line 39), but its reply instruction asks only for the keys id, parts and finding. The Skill puts ask in the next move, the trial could not carry it, and Case T3 compares only the finding. So T3 measures the Skill through a narrower report than the one the Skill prescribes. Whether the finding ought also to read ambiguous is a design choice of F3 that the Owner owns.
- Testable, not tested. Whether a Skill-only agent answers the next move ask for S4, which F3 requires, when it is asked for the next move. A test would have to show, over at least three runs against an oracle fixed before the runs, the next move given for S4 with the Skill and without it. Inferred: no run asks for the next move.
- Judged. A1 promises the key is written before the Skill, so that the Skill cannot be tuned to it. That holds for the first version only: S10 was reworded after the Skill-only answer disagreed (`trial/run1` against `trial/run2`), and S4 changed from solution with finding disguised to delivery with finding ambiguous after the CPO review. Both changes are disclosed in `do.md` and the earlier runs are kept. Checked: `trial/run1`, `trial/run2`, `do.md`, the commits bfee577, ec066f0 and bf42468.

### Delivered, not promised

- Judged. The Skill's report names a next move keep, split or ask (SKILL.md line 39), and no requirement F1 to F3 or N1 states it. It appears only in the proposal. The Intent is served by it, but Case T3 and the key were built without it. Checked: the files under `02-requirements` for the words next move, none found.
- Judged. The Skill adds the rule not to invent a third concern and to flag a statement that fits neither. Checked: SKILL.md Rules, against F1 to F3. It serves I1 and adds a possible finding the key does not cover.

### Promised and delivered

- Proven. N1 promises one compact Skill that names no organization, domain or technology. Case T4 checks the length of at most 120 lines and the absence of named domains, and `do.md` records it green. Checked: `do.md`, T4.test.mjs. Not re-run by this review.
- Judged. F3 promises that a constraint stays with the concern it constrains. S4 answered delivery by the Skill-only agent is consistent with that, and the baseline answered both concerns. Checked: SKILL.md "Constraint across the line", `trial/skill.json` S4, `trial/baseline.json` S4.

## Evidence

Inspected: skills/kaal-architecture/SKILL.md; scenarios.json at bfee577 and at bf42468; trial/skill.prompt.txt and trial/skill.json; trial/baseline.json; trial/run1 and trial/run2; T3.test.mjs; do.md.

- **Does S4 need the finding ambiguous?** Not shown, and not shown to be unnecessary. The trial could not record the next move where the Skill puts ask (see the Judged finding above), so T3 cannot tell a Skill that fails to ask from one that asks only in the next move. The Skill-only run 3 and the baseline never answered ambiguous for S4. The question for the Owner is whether ambiguous is a finding value or only the move ask.
- **What does the baseline comparison establish?** Little. In run 2 and run 3 both arms match the key on nine of ten statements, and they differ only on S4. The baseline matching the key on nine of ten is itself a finding about how much the Skill adds on these statements. One run per arm cannot separate the Skill from sampling. The Skill did produce delivery for S4, where the baseline answered mixed, once.
- **How independent of the Skill is the key?** Partly. The key was written before the Skill in its first version, and that holds for the first version only: two of its ten answers were corrected after being seen. An independent check of the key sits with the owner of Case rules and keys before a Case exists, and this review sets none.

No trial is run by this review. A test is not run by a review.

## Not checked

- The Skill's behavior under a prompt that asks for the next move: no such run exists (the Testable, not tested finding).
- The Cases T1, T2, T5, T6, T7 and T8: their results are the author's record in `do.md` and are not re-run here.
- Whether the ten statements are representative of the statements agents will meet.
- The CPO's review of #1534 beyond what `do.md` records.

## Limits

The reviewer is an Agent, and its judgement is not proof. It is of one model family with the Agent that wrote the Skill and with the trial agents, which leans toward the author's output. Where the Skill-only agent was told to use no tool, that instruction was not enforced, and this review cannot tell. No human has judged this review.

## For the Owner

1. T3 red on S4: option one, accept it as a documented limitation of a single narrow trial; option two, have the owner of the key and of the Skill decide whether ambiguous is a finding value or only the next move ask, and amend one of them; option three, hold the Skill until the next move can be observed.
2. Evidence that the Skill adds value over the baseline: option one, accept the trial as it stands, with nine of ten matching in both arms; option two, ask for evidence on statements where the baseline fails before the Skill is relied on. Kai has said that agent quality is believed to improve and cannot be proven yet, so this is a decision about what is accepted without proof.
3. What a human should observe for themselves: the S4 statement and the choice between ambiguous and ask.

## No authority

This review grants no authority. It approves, merges and decides nothing. It changed nothing of the reviewed work, no Case or key was weakened and no change is asked of the reviewed work for the sake of this review.
