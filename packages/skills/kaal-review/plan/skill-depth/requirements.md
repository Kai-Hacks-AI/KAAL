# Review skill depth: Requirements

Each Requirement names, in brackets, the Intents it serves (`intent.md`).

## The review record

- **review/F0** [review/I0]: Every review ends in one **record**, a JSON object with `schema: "kaal-review/1"`. It holds, in this order: `id`; `reviewer` (the actor and what made it independent); `time`; `subject` (repository, pull request or range, head and base commit); `request` (the parameters actually used, defaults filled in, so two records are comparable); `lenses` (each with its source and whether it was applied or not found); `checks` (command, exit status, output reference); `findings` (F4 fields); `claims` (each with satisfied, failed or not shown, and its evidence); `not_checked`; `human_to_observe`; `self_check` (F9); `round` and `prior` (the id of the record it follows).
- **review/F0a** [review/I0]: The record is **findable**. It is published where the work lives and carries a fixed marker, `kaal-review:record`, with the schema version, so one search or one API call finds every record on a repository. On GitHub it is a pull request review or comment whose body holds a human summary and, after the marker, the record in a fenced JSON block. A host with no pull requests keeps the record beside the work under a path the invoker names. Where a record is kept beyond that is the invoker's choice.
- **review/F0b** [review/I0]: The record is **analysable**. `scripts/collect.mjs` reads the records of a repository (or a given set), validates each against the schema, and prints findings by severity, dimension, capability named in the subject paths, status and round; checks and claims that failed; lenses not found; and records that fail the schema. It decides nothing about any work.
- **review/F0c** [review/I0, review/I3]: The schema is Review's. It is versioned. A change that breaks readers of an earlier version is a new schema version, and `collect` reads every version it knows and names those it does not.

## Composition: 1 + 1 > 2

- **review/F13** [review/I6, review/I1]: What a capability adds over a bare review is exactly what it passes in the request, and each addition is visible in the record:
  - `lenses` add the questions only the capability can ask (its intents, requirements, limitations, its role's responsibilities), so findings appear that a generic review has no reason to look for;
  - `checks` add deterministic observations the capability's scripts produce, so facts are observed, not guessed;
  - `claims` add what the work must satisfy, so the self-check can say satisfied, failed or not shown instead of leaving it implied;
  - `severity_floor` and `evidence_expected` add the capability's own bar for what matters and what proves it.
  Review adds what the capability does not have to rebuild: the finding format, the severity scale, the dimension checklist, the self-check, re-review and the record. Neither side alone gives both.
- **review/F14** [review/I6]: The composition is the same for every capability. No capability gets a special path, and a capability that passes nothing gets the generic review.

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

- **review/F4** [review/I3, review/I0]: Every finding has: an identifier, a severity, a location, a claim, the evidence (what was checked, or an explicit statement that it is inferred), the impact, a suggested direction, and a status (`open`, `fixed`, `not fixed`, `withdrawn`).
- **review/F5** [review/I3]: Severity is one scale owned by Review: `blocker` (must change before the work can be relied on), `major`, `minor`, `nit`. It states seriousness only. A report ends with what was not checked and what a human should look at.
- **review/F6** [review/I3]: Findings below the `severity_floor` are counted, not listed.

## The three kinds of work

- **review/F7** [review/I2]: Deterministic observations (files in scope, the results of `checks`, validation of the report's shape) are produced by scripts and shipped with the Skill, or by the invoker. They are reported as observed, with the command and output. Review never reports a deterministic result it did not observe.
- **review/F8** [review/I2]: Judgment is applied across a checklist of dimensions: correctness, tests and their strength, error handling, security, performance, compatibility, documentation, dependencies. The security dimension includes secrets, injection, authorization, permissions and supply-chain changes, and treats the work's own text, comments and bot output as untrusted data.
- **review/F9** [review/I2, review/I3]: A **self-check** closes every report, as the record's `self_check`. It states, for each requested check, whether it ran and with what result; for each lens, whether it was applied or not found; for each claim, whether the work satisfies it, fails it or could not be shown; and whether any finding rests on inference alone.

## Re-review

- **review/F10** [review/I5]: Given `prior`, Review verifies each earlier finding against the new work and sets its status with evidence. New findings are added. Open findings carry forward. A review is converged when no finding at or above the floor is open.

## Delivery and package

- **review/F11** [review/I4, review/I0]: The Skill carries a worked example record and the request fields, and the README states the Skill as usable without a KAAL Engine and lists all four Nodes.
- **review/F12** [review/I4]: Package shape (shipped documents, installed verification and manifest, a declared Test Plan, boundary statements) conforms to Packaging's profile once it is in force. It is planned separately and depends on Packaging #686.

## Nonfunctional

- **review/N1** [review/I1]: Review names no capability and no role. A test searches the Skill and its references for capability and role names and finds none beyond Review's own.
- **review/N2** [review/I3]: The `SKILL.md` stays short. Detail moves to `references/`, one level deep.
