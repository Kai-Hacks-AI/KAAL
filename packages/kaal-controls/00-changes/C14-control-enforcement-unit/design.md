# The Control Enforcement Unit: design and slices

The unit is the GitHub App "KAAL Inspector", part of kaal-controls. It fills the Reviewer role of WORK next to the CPO (the CPO judges content, the Inspector judges controls) and never opens or merges a pull request. A control declares its stations, a judge step with no secret runs the controls registered at a station from the base, a sign step that holds the only secret posts one check per control on the exact head, and a ruleset requires the check pinned to the App. UNKNOWN never passes. The package holds the generic parts and knows no project; Engineering holds KAAL's instance.

Kai's rule of 18 Nov 2026: build it in thin slices. Each slice is its own Change, provable alone, and nothing of a later slice is built before it.

| Slice | Delivers | Cases | Needs from Kai |
| --- | --- | --- | --- |
| 1, controls/C14 | `stations` in a declaration, `registry.mjs`, the enforcing reference | T920, T921, T928 | nothing |
| 2 | `judge.mjs`: a control's `judge.mjs` from the base, PASS, FAIL or UNKNOWN | T922, T923 | nothing |
| 3 | `sign.mjs`: verdicts to checks, one per registered control, pure part only | T924 | nothing |
| 4 | the workflow template, the App manifest template and the judge-versus-sign separation | T925, T926 | nothing yet |
| 5 | KAAL's instance map in `engineering/controls`, then the App created, its key stored and the ruleset installed | T927 | the App, the key, the WIRE |

The Cases of slices 2 to 5 are written and were each seen RED and then green against a throwaway implementation; they are kept at `/mnt/project-files/controls/c14-later-slices/` and move into their own PLANs. Registering release/CTL8 with a `judge.mjs`, the ruleset pin (release/C66) and `verify Stages` reading the registry (release/C70) are release's Changes and depend on slices 1 to 5.
