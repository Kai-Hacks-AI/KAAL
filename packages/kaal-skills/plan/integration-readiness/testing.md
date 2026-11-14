# kaal-skills: integration readiness (Testing)

The planned Cases live in `packages/kaal-skills/test/plan/integration-readiness/`, named `T<n>.red.mjs`. Each exports `id`, `tests`, `title` and an async `run()`. They read the repository (T267 also reads a pinned snapshot of Architecture's Skill) and build throwaway subjects in a temp directory. They are immutable to DO. The DO renames them `.test.mjs` when GREEN and adds them to `kaal-skills`' `npm test`.

Claims first (the Testing Skill's order): every Requirement below has an observable and an oracle two readers would accept, except N2 and the quality of any `skill` mechanism, which are judged (see the last section).

| Case | Checks | What it decides deterministically |
| --- | --- | --- |
| skills/T260: a declaration reads or is refused, and a capability without one is unknown | skills/F1 | Testing's draft reads; seven malformed variants (other owner, no mechanism, duplicate name, bad level, bad kind, missing docs, missing module) are refused; in a throwaway repository `discover` returns a declared package with its declaration and a silent one with `declaration: null` and status UNKNOWN |
| skills/T261: a script mechanism is called by its declared invocation and disturbs nothing | skills/F2 | Testing's `duplicates`, `report` and `inventory` run as modules; a command subject runs with stdin closed; a wrong export, a mechanism that throws, and a module or a command that writes into its package are refused |
| skills/T262: the declared reading tells clear, report and unknown apart | skills/F3 | Testing's `duplicates` and `report` read as clear/report/unknown with reasons; a value under two outcomes, the undecidable value read as clear, and a missing reason are refused; a mechanism or a command that answers clear to everything is refused |
| skills/T263: the rule is told apart through the declared invocation alone | skills/F4 | three distinct outcomes for Testing's two checks; a mechanism with no unknown fixture is UNKNOWN, never PASS; three fixtures that read alike are refused |
| skills/T264: judgment is declared as judgment | skills/F5 | Testing's `assess-claim` (Skill, section, result shape, no outcome) reads; a claimed outcome, a missing shape, a missing section and a missing Skill file are refused |
| skills/T265: the declaration names no host | skills/F6 | four host names in a declaration are refused; a prose line that says a capability "does not install workflow files" is not judged by a word list |
| skills/T266: `kaal-skills` is inert | skills/N1 | private `package.json` with no exports, main, bin, files or dependencies; no package depends on or imports it; no hook, workflow or Guard configuration names it or requires a declaration |
| skills/T267: a judgment Skill is activated by a pointer, not a decision | skills/F7 | Testing's `assess-claim` (on `main`) and Architecture's `classify` (a snapshot of its collector, the CPO's functional-placement example) declare a situation and a reminder that names the Skill and the section, within 280 characters; no activation, no situation, a reminder that names no Skill, points at no section, is too long, or claims a gate is refused |

## Why the Cases are fair

They take Testing's own mechanisms as the subject and do not generalize its implementation: the readings map `result`/`findings[].kind` values that Testing already returns, and the fixtures are the three inputs Testing already distinguishes. T262 also pins Testing's `accept` to be read by its findings, never by `passed`. T261 and T262 also run a *command* subject, because Testing has no command and the contract must not be shaped by the one capability that has none. They check structure and behaviour, never a sentence of any Skill or README (T265 pins this: prose is not word-listed).

## RED evidence

Run `node packages/kaal-skills/test/plan/integration-readiness/run-red.mjs` from the repository root. On this PLAN all eight are RED, for the right reason: the evaluator (`test/lib/conforms.mjs`) and the package manifest do not exist.

```
RED   skills/T260  missing: packages/kaal-skills/test/lib/conforms.mjs (the common evaluator, exporting conforms, verdict and discover)
RED   skills/T261  (same)    RED   skills/T262  (same)    RED   skills/T263  (same)
RED   skills/T264  (same)    RED   skills/T265  (same)
RED   skills/T266  missing: packages/kaal-skills/package.json
RED   skills/T267  (same evaluator)
```

Two further runs show the Cases mean something. They used a scratch evaluator (a copy of the prototype in `evidence/conforms.proto.mjs`, plus `discover`, plus a private manifest), then removed it: all eight were GREEN. A scratch evaluator that answers PASS to everything turned T260 to T265 RED, each on a refusal it should have made (`a declaration with another owner id must be refused`, and so on). The scratch files are not in this PLAN; the prototype and its output are.

## What cannot be tested, and who judges

- **skills/N2**, and whether a `skill` mechanism's guidance is *good* (is the Architecture classification right, is a Review fair?). These can only be judged. The evidence is `evidence.md` and `assessment.md`; the judge is a reviewer from a seat that is not the author's (Review), and the CPO for the contract itself.
- **What F2 does not establish.** Nothing changed in the package is observed; a write elsewhere, or a network call, is not. T261 says "changes nothing in its package", never "side-effect free".
