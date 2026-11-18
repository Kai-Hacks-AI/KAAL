# C70 do

## What the DO added

- `05-src/stages/judge.mjs` equal to the draft of `interface.md`: the judge holds no shape of a branch ruleset. For each branch ruleset it reads the `rules` its stage declares and the controls of the checkout (`id` and `has` of each `CTL<n>.md` under `04-controls`, exported through the facts as `controls`), and fails when the ruleset holds other rule types than the declared ones, a setting that differs from or is missing in the declaration, other checks than the declared ones (in any order, each with its `integration_id`), or a rule or check that traces to no declared control or to one without an Intent. The target, the refs and the empty bypass list are judged as before.
- `05-src/stages/stages.json`: each of Integrating, its three parts and Promoting declares `rules` with the controls, settings and checks of today's rulesets (release/CTL1 for every `verify Stages` check, release/CTL5 for `analyze Vulnerabilities (Promoting)`). The verdict on the real sources does not change: the CLI judge passes Integrating, Collecting, Hotfixing, Wiring, Promoting and Developing.
- T900 to T903 renamed from `.red.mjs` to `.test.mjs`. All four are green.
- The shared helpers of release/C35 and release/C37 supply the controls the judge now reads (`CONTROLS`: release/CTL1 with release/I27, release/CTL5 with release/I30).
- release/T513 reads the checks of the Integrating rule where it read `requires`.
- release/T760 and T761 (release/C59) and their `fixtures.mjs` are removed: they tested the `also` key and the order of the extra check, which T900 to T903 now cover with the declaration and any order (the PLAN named them superseded). T483, T487, T511 and T512 pass again with the controls in the helpers and are otherwise unchanged.
- The `rules` wording replaces `alsoRules` in `change.md`, as the CPO asked.

## A departure from the PLAN, and why

The PLAN said `rules` replaces `requires` and `also`. `verify Stages` runs `main`'s own judge on the PROMOTION, and `main`'s judge still reads `requires` and `also`: run on a tree that has only `rules`, it fails Integrating ("the required checks must be verify Stages (Integrating)") and Promoting. So `stages.json` keeps `requires` and `also` beside `rules` for now; the new judge ignores them, and both judges pass the tree (checked above). Dropping the two keys is a small follow-up once this Change is on `main`.

## Checked beside the Cases

- The Cases runner (`engineering/cases/cases.test.mjs`): 201 tests, 189 pass, 12 fail; the 12 are the unnamed Cases of `collector-capability/00-changes/C15-collector-capability` (T268 to T279), which fail on `main` too.
- Not traced, as the PLAN said: the ruleset-level settings, `enforcement`, the refs, the empty bypass list as an expectation, `strict_required_status_checks_policy` and `do_not_enforce_on_create` beyond their declared value, and the Publishing tag rule. Each needs a control and an Intent or an explicit decision, as a Change of its own. Nothing is wired.
