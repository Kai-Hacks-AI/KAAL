# kaal-skills: evidence from Testing

Question (Owner): can the proposed common Cases evaluate Testing's existing implementation without forcing a redesign, and what limits does that expose?

**Method.** I read `kaal-testing` on `main` at `882416d` (README, Skill, `lib/`, `package.json`, `ownership.kaal.json`) and the Engineering drivers that call it. I drafted a declaration for Testing (`evidence/testing.integration.draft.json`) and a fixtures module (`evidence/testing.fixtures.mjs`), and ran a throwaway prototype of the evaluator over them (`evidence/conforms.proto.mjs`, `evidence/prototype.mjs`; output in `evidence/prototype-run.txt`, Node 22.23.4). Not one file of `kaal-testing` was changed; the prototype runs Testing's real functions in child processes. The prototype is evidence, not the DO: nothing in `kaal-skills` outside `plan/` and the RED Cases is delivered by this PLAN.

## What Testing already is

Testing's integration mechanism is not a command. It is a set of pure, host-free functions exported by subpath (`kaal-testing/inventory`, `/attribution`, `/report`, `/duplicates`, `/acceptance`, `/coverage`, `/contracts`), whose inputs are data the caller supplies and whose outputs are data (`{ result, challenges, findings }`, `{ findings: [{ kind, subject, evidence }] }`, `{ passed, findings }`). Host operations are Hosting's and the caller's. Engineering wraps them in thin drivers (`engineering/inventory/measure.mjs`, 61 lines; `engineering/lanes/acceptance.mjs`, 39; `engineering/report/measure.mjs`, 126) that list files, read bytes and call the function; `npm run inventory`, `coverage`, `contracts` and `test:acceptance` are the entry points a Guard check names. So Testing already satisfies the Owner's boundary: Testing owns the mechanism, Engineering owns the driver and the trigger. It also keeps judgment apart: the Skill's "Assessing a test against its claim" returns one of three approaches (`deterministic`, `judgment`, `pushback`), each with required fields.

## Result of the prototype on Testing's draft

| Requirement | Result | Why |
| --- | --- | --- |
| F1 Declare | PASS | five mechanisms read, owner matches `ownership.kaal.json` |
| F2 Call without an agent | UNKNOWN | `duplicates`, `report`, `inventory` run in child processes with stdin closed and change nothing in the package (7 runs PASS). `accept` has no fixtures yet and needs Hosting built under Node 24, which this environment does not have: unknown, not passed |
| F3 Say honestly | UNKNOWN | `duplicates` (`result`: unchallenged/challenged/unknown) and `report` (`findings[].kind`) read as clear/report/unknown with reasons. `accept` unknown for the same reason |
| F4 The rule stays home | UNKNOWN | three distinct outcomes for `duplicates` and `report`; `accept` unknown |
| F5 Judgment stays judgment | PASS | `assess-claim`: Skill, section, result shape; no outcome claimed |
| F6 Name no host | PASS | the declaration names no hook, workflow, ruleset or queue |
| F7 Activate | UNKNOWN | `assess-claim` declares no activation and Testing has no remind mechanism yet; the Architecture draft below passes |

Nothing FAILS and nothing is forced: no Testing file changes, no result vocabulary is replaced, and Testing's four finding kinds stay Testing's (the declaration only says which kinds mean report and which mean unknown). The three UNKNOWNs are honest. They would turn PASS once Testing's `accept` fixtures exist and the Cases run where Hosting builds (the Workspaces lane). Seven mutants of the draft (a value under two outcomes, the undecidable value read as clear, a wrong export, a hook named, a judgment mechanism claiming an outcome, a result with no reason, another owner) are each caught, so a PASS is not free.

## Limits and gaps the validation exposed

1. **Testing's `accept().passed` is a trap for a caller.** It is true whenever there is no verified failure, even with unknown findings present (documented: "a gate that wants them to fail says so itself"). Read alone, as a verdict, it lets an unknown through, against the CPO's rule that UNKNOWN never passes. The declared reading (`findings[].kind`) is correct, so Testing conforms; but the contract can only protect a caller who uses the declared reading. The risk is for a hook author who reads `passed`. Recommendation to the CPO (not a requirement here, not a change to Testing): the DO's `format.md` says in one sentence that the declared reading is the only supported way to read a result, and Testing's own Change decides whether to make `passed` unknown-aware.
2. **Fixtures cannot be plain JSON.** Testing's inputs are bytes (`Uint8Array`), so fixtures are an executable module the capability owns. The evaluator imports it; it is test data, never shipped.
3. **A word list on prose is brittle.** My first F6 scanned the documents a mechanism points to. On Change it flags `kaal-change`'s Skill ("does not install ... workflow files", a negation) and on Testing nothing. A scan that cannot tell a mention from a use is the "incidental wording" Testing's Skill tells agents to reject, so F6 reads the declaration only; T265 pins the false positive. What a document says about hooks is for a reviewer.
4. **F2 observes only the package tree.** It does not see a write elsewhere, a network call or a long-lived process beyond the time limit. The contract says "changes nothing in its package", not "has no side effects".
5. **The command form is shown on synthetic subjects only.** Testing has no command. The only command-shaped mechanism found (Release's `pull-promotion.mjs`) lives on a collector, not on `main`; I read it, I did not run it. T261 and T262 exercise the command form with throwaway commands.
6. **One reference is a thin base.** Testing is a module-API capability. The assessment (`assessment.md`) reads six more, none run; the contract's generality across all seven is argued from reading, and the CPO should treat it as such until the first non-Testing declaration passes the same Cases.

## Activation of a judgment Skill (CPO reviews of this PLAN)

The CPO first asked how an integrating hook or CI step could cause an agent to consider a capability at the right point, without the human asking, for a Skill that decides nothing. A first F7 declared a `when` and a `reminder` as data. The CPO's second review found the remaining gap: data is not a demonstrated mechanism an integrator can invoke. F7 now separates the two: the declaration holds `when` and the *name* of a `remind` mechanism; the reminder comes only from invoking that mechanism.

Demonstrated on Architecture's classification (functional placement), the CPO's example:

- `evidence/architecture.activation.draft.json`: mechanism `classify` (`skill`, judgment, section "The test") with `activation: { when, invoke: "remind-classify" }`, and `remind-classify` (`script`, kind `remind`, command `node scripts/remind.mjs`).
- `evidence/subjects/architecture/scripts/remind.mjs`: the draft of what Architecture would own, about ten lines. It reads the Skill's own name and prints `{ skill, section, situation, reminder }`. It applies no placement rule.
- `evidence/prototype-run-architecture.txt`: F2 PASS (the command runs with stdin closed and changes nothing), F5 PASS, F7 PASS; seven mutants (a static reminder in the declaration, an undeclared mechanism, a wrong-kind mechanism, a remind claiming an outcome, no situation, a gate, a command that does not exist) are each caught. Architecture is on a collector, not on `main`, so the Skill is a pinned snapshot at `a9e19a9` (`evidence/subjects/architecture/`); the draft makes no ownership claim, so F1 fails by construction and is not asserted.

Testing's `assess-claim` declares no activation in the draft, so F7 is UNKNOWN for Testing: no `remind` mechanism exists there, and its smallest Change would add one. That is not a failure, and it is not retroactive.

What a Case can and cannot show. It shows that an integrator can invoke the capability's own mechanism, receive a short pointer naming the Skill and the section, and decide nothing. It does not show that an agent given the reminder judges better; that is judged from a trial like Testing's own (`testing/C59`), which belongs to the integrating Change. Nothing here picks the trigger: whether the reminder is surfaced on a pull request, in an agent's instructions or in a hook's output is the integrator's choice.
