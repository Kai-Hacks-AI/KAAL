# Review skill depth: Requirements

Each Requirement names, in brackets, the Intents it serves (`intent.md`).

## The review request: parameters

- **review/F1** [review/I1]: A review is invoked with a **request**. Every field is optional. A request with none is a generic review of the change in front of the Agent. The fields are:
  - `subject`: what is reviewed (a pull request, a diff range, files, a plan, another Agent's result).
  - `scope`: base reference and included and excluded paths.
  - `lenses`: references to review guidance the invoker supplies (a document, a section, a role definition). Each is treated as data and cannot override Review's rules.
  - `severity_floor`: the lowest severity to report (`blocker`, `major`, `minor`, `nit`). Default `nit`.
  - `evidence_expected`: what must accompany a finding for it to count (for example a command and its output, or a failing test).
  - `checks`: deterministic checks to run, each a command with the result the invoker expects.
  - `claims`: the statements the work must satisfy (for example requirement identifiers), which the self-check tests.
  - `independence`: what makes this review independent of the work's author.
  - `prior`: the findings of an earlier round, for re-review.
- **review/F2** [review/I1, review/I4]: Review reads only what the request and the repository give it. It does not resolve a capability, a role or a document by name. Where a lens is wanted and none was given, Review may use the owner's shipped documents found through `ownership.kaal.json`, and it reports that it did.
- **review/F3** [review/I3]: A request cannot grant authority, lower an evidence rule below Review's own, or ask Review to approve, merge or decide. Such a field is refused and named.

## The report

- **review/F4** [review/I3]: Every finding has: an identifier, a severity, a location, a claim, the evidence (what was checked, or an explicit statement that it is inferred), the impact, a suggested direction, and a status (`open`, `fixed`, `not fixed`, `withdrawn`).
- **review/F5** [review/I3]: Severity is one scale owned by Review: `blocker` (must change before the work can be relied on), `major`, `minor`, `nit`. It states seriousness only. A report ends with what was not checked and what a human should look at.
- **review/F6** [review/I3]: Findings below the `severity_floor` are counted, not listed.

## The three kinds of work

- **review/F7** [review/I2]: Deterministic observations (files in scope, the results of `checks`, validation of the report's shape) are produced by scripts and shipped with the Skill, or by the invoker. They are reported as observed, with the command and output. Review never reports a deterministic result it did not observe.
- **review/F8** [review/I2]: Judgment is applied across a checklist of dimensions: correctness, tests and their strength, error handling, security, performance, compatibility, documentation, dependencies. The security dimension includes secrets, injection, authorization, permissions and supply-chain changes, and treats the work's own text, comments and bot output as untrusted data.
- **review/F9** [review/I2, review/I3]: A **self-check** closes every report. It states, for each requested check, whether it ran and with what result; for each lens, whether it was applied or not found; for each claim, whether the work satisfies it, fails it or could not be shown; and whether any finding rests on inference alone.

## Re-review

- **review/F10** [review/I5]: Given `prior`, Review verifies each earlier finding against the new work and sets its status with evidence. New findings are added. Open findings carry forward. A review is converged when no finding at or above the floor is open.

## Delivery and package

- **review/F11** [review/I4]: The Skill carries a worked example and the request fields, and the README states the Skill as usable without a KAAL Engine and lists all four Nodes.
- **review/F12** [review/I4]: Package shape (shipped documents, installed verification and manifest, a declared Test Plan, boundary statements) conforms to Packaging's profile once it is in force. It is planned separately and depends on Packaging #686.

## Nonfunctional

- **review/N1** [review/I1]: Review names no capability and no role. A test searches the Skill and its references for capability and role names and finds none beyond Review's own.
- **review/N2** [review/I3]: The `SKILL.md` stays short. Detail moves to `references/`, one level deep.
