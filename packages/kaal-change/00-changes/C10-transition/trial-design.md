# C10 trial design

A trial is accepted only with provenance, as for `kaal-architecture`'s trial, which this one repeats without depending on it.

1. The key (`03-architecture/A24-transition-package/scenarios.json`) is written before the Skill, so the Skill cannot be tuned to it.
2. `trial/skill.prompt.txt` holds the Skill as shipped followed by its reference, the example (`example.md` sections "Current state", "Intended outcome", "Change") the nine statements and the two transformations (D1, D2) of the key, and nothing else. It carries no key, no kind and no finding. Its sha256 is recorded in `trial/skill.json`.
3. The agent is asked, per statement, for the kinds of truth it carries and for a finding, for each transformation, whether one Change suffices or how many are needed with their boundaries, and then for an explanation answering the five questions: the current state, the intended outcome, what changes, what is superseded and what remains protected, and what evidence shows the transition.
4. `trial/skill.raw.txt` is the agent's output, unedited. The answers recorded in `skill.json` must equal it.
5. `skill.json` names the observer, who must not be the author, the agent, the model and the date, and the observer's verdict on whether the explanation keeps historical and intended-outcome truth apart.
6. `trial/existing.*` is a control: the same prompt with the kaal-change `SKILL.md` as it was before this Change and no transition guide. It shows what the integrated guidance adds to the existing Skill, not only to no Skill.
7. `trial/baseline.*` is the same trial with the prompt lacking only the Skill. It is recorded and reported, so that what the Skill adds is visible. A baseline that already matches the key is a finding about the Skill.
8. A difference from the key is reported, never corrected silently.

Success: the Skill-only answers equal the key (D1 one Change, D2 three with boundaries), and the observer finds that the explanation never presents a historical Case as evidence of B.
