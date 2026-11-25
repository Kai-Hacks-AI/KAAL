# C140 change

## PLAN

1. Add the intent I18, the gap G106, the Requirements F201 and F202, the architecture A201, the trial `trial/trial.md` and the Cases T1506 to T1508. All three Cases are RED on the collector.
2. No Skill word, reference or script changes in the PLAN.

## DO

Not authorized by this PLAN, and not before core/C52 is merged into main and this collector is synced with it. Then:

1. Restructure the ratchet text within the Skill standard Core ratified: findability, the contrast, the worked example, the declaration fields only in `declaring-controls.md`, baseline, history and retirement.
2. Cases T1506 and T1507 GREEN; the package suite GREEN.
3. Kai runs `trial/trial.md` on the three agents and records `trial/results.json`. T1508 GREEN is the acceptance of the trial.

## ACT

A retro entry in the collector.

## Left open (for the CPO, with a recommendation)

- Dependence on C52. Recommendation: the DO waits for it, and the DO follows whatever Core ratified for size, layout and generation; a sentence in this PLAN that disagrees with C52 yields to C52.
- Number of runs. Recommendation: three runs per arm per agent, with and without the Skill, so the trial finishes in one automatic pass. The research was limited and the trial says so.
- Judge. Recommendation: a session other than the subject's; where the three agents can judge each other's answers, use that. Blinding will probably fail as in E1; the record states it.
- The pass bar (in `trial.md`): the Skill arm opens `SKILL.md` in every run, reaches 2 or more on contrast, example, baseline and history, and fail-closed unknown, scores 3 on clarity, and is not below its own agent's blank arm on any criterion. Recommendation: accept it. The bar is a judgment of the Owner, not a Case.
- Research owns the technique of research; controls owns the judged trial of its own Skill. Recommendation: ask research to read `trial.md` for technique before the DO, not for its content.
- Ids C140, I18, G106, F201, F202, A201, T1506 to T1508 are taken by hand; on a clash the newer pull request renumbers.
