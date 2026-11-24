# engineering/D4: verify Layout does not say in or out of spec

Owner: the engineering capability (the layout, `packages/kaal-engineering/skills/kaal-engineering/references/package-layout.json`, and its control engineering/CTL2 verify Layout). Raised from Kai's wish for a full in-spec or out-of-spec answer.

## Record

```json
{
  "id": "engineering/D4",
  "context": "engineering (the layout template and the check scripts/check-layout.mjs, control engineering/CTL2 verify Layout; Intent engineering/I4)",
  "expected": "verify Layout answers whether a capability folder is in or out of the layout, in both directions: it names what is extra (a folder or a root file the template does not have, numbered or not) and what is missing (a part the template requires, such as AGENTS.md or the folders 10 to 14). PASS only when nothing is extra and nothing is missing.",
  "observed": "judgeLayout flags only numbered folders (`/^\\d\\d-/`) that the template does not have, a dist, a closed folder with a stray child and an element folder without its verifier. Unnumbered folders (plan, test, lib, bin, skills, payload, capability) and unknown root files are never read as extra. Nothing is read as missing: a folder holding only `00-backlog/x.md` answers PASS, with no AGENTS.md and none of the folders 10 to 14. The template also does not say which parts are required: only `runs` is marked optional.",
  "where": "packages/kaal-engineering/skills/kaal-engineering/scripts/check-layout.mjs (judgeLayout), and references/package-layout.json (no required parts)",
  "reach": "packages/kaal-engineering/skills/kaal-engineering/scripts/check-layout.mjs; the template; control engineering/CTL2",
  "status": "confirmed",
  "reproduction": "From the repository root: judgeLayout(template, ['00-backlog/x.md']) answers PASS with no finding (nothing missing is seen). judgeLayout(template, ['plan/x.md','lib/a.mjs','bin/b','junk.txt','00-backlog/x.md']) answers PASS (nothing extra is seen); the unnumbered folders and the root file are not in the template."
}
```

## What is shown, and what is not

Shown: both directions escape the check, by the two calls above. They need no real capability folder: the judge is pure over the template and the tracked paths.

Not shown, and not decided here: which parts the template requires (that is the layout's own decision and may need the template to mark required parts, and which root files and unnumbered folders are allowed, as `agents` and the root list already say for some), how a finding is worded, and whether the check becomes preventive; CTL2 stays detective until its Owner decides. A first run over every capability gives the baseline the ratchet tightens against.

## Case

None on a collector. The Cases are the closing Change's (engineering/C30): one RED on main for each direction, missing and extra, as plain `.test.mjs`, shipped with the fix. This is a normal Change, not a hotfix.
