# Trial record (primary): packaging/T51 and packaging/T52

This is the second trial, run to correct the first (`record-1-diagnostic.md`, kept unchanged in substance as diagnostic evidence) after the CPO review of #881. The first trial's outcome hints were: scenario file names ("adequate", "omission", "unsupported"), and the T51 row in `docs/testing.md` that the agent encountered.

## Candidate and inputs

- Skill under trial: `skills/kaal-packaging/SKILL.md` at commit `0d2af15`, unchanged from the first trial. Requirements: the shipped `docs/requirements.md`, with README and the other shipped docs, except `docs/testing.md`, which was withheld because its T51/T52 rows describe the expected outcomes.
- Supplied material: three neutral accounts `account-A.md`, `account-B.md`, `account-C.md` (copies in `neutral/`). They are the original scenarios with neutral identifiers, a different order (A is the unsupported-claim scenario, B the adequate one, C the omission) and the hint sentences removed. The reader is not told which, or that any is adequate or flawed beyond "any of the three may be".
- `expected.md` was not accessible: the agent could read only a scratch directory (`/tmp/trial2/`) that held the shipped Skill, README, five shipped docs and the accounts. Expected classifications are in `expected.md`, committed in `96d99b1` before either trial.
- The package `acme-sizer` is hypothetical; no installed copy, `test/verify.json` or fixtures exist, so no script could be run.
- Run: 2 November 2026, one fresh general-purpose agent, no Engine.

## Independence

A separate session with none of this session's context and none of the guidance author's reasoning. Same model family as the author, not a different provider; the CPO asked for no change of provider. The agent was also told to report any hints. It reported residual structural hints: the Skill's worked example and five-point claim match line up with accounts C and A, and account B's explicit "not run" statements read as the control. These cannot be removed without changing the Skill or the requirements, which the CPO asked to keep the same. It also stated it tried to judge each account on its merits, and it found weaknesses in B that the structure did not point to.

## Inspection choices and tool observations

It read the Skill, README, `docs/requirements.md`, the three accounts and a grep of `docs/operations.md`. No script ran on an acme-sizer copy. It named the scripts it would run on a real copy (`conform` with `--testing` and `--work`, `measure`, `sha256sum`, direct reads of `test/verify.json` and the Case sources) and why. Script observations are therefore none in this trial. Full inspection list in `record-2-agent-report.md`.

## Agent judgments

The agent's reasoning is recorded in full in `record-2-agent-report.md`. In brief, with its stated reasons (compared with `expected.md` set beforehand):

- **Account A (unsupported claim): matches.** It judged the boundaries and Cases adequate and the claim not warranted. Reasons: the CI run built a different artifact (1.2.1-rc, digest `c8e4…0d17`) than the candidate (`9f2c…a41e`); Linux ran Node 22, not 24; the Windows log is truncated; macOS ran the source suite, not the installed verification; only the local Linux, Node 24.22.1 run matches candidate and runtime and supports a narrower claim. It rejected "CI passed on all three hosts" because the details contradict it.
- **Account B (adequate): matches.** It inferred the claim (T1–T6 verify on the 1.2.0 candidate, fresh consumer, Linux, Node 24.22.1), checked identity across the account, the run and the release record, and found the evidence warrants exactly that and nothing about macOS or Windows. It raised softnesses without rejecting the account: T5 may pass trivially, the case list is shorthand, the test-time npm is not stated.
- **Account C (omission): matches.** It found that B4's refusal obligations (path outside the working directory, never overwrite) and its state-preservation obligation have no Case, that T7 covers only success, that a broken implementation would still verify, and that the passing run does not evidence B4's refusals. It also raised, unprompted, a tension between B2 (never write outside the scratch directory) and B4 (writes to the working directory) and an unlisted incoming `--record` surface.
- It kept observations, judgments, unknowns and Owner decisions apart, and left test content with acme-sizer and release authorization with the Owner.

## Unresolved unknowns

- Whether a different reviewer would draw the same lines on borderline points (T5, shorthand case list).
- Whether the Skill works with an installed copy and a real `conform` run; none existed.
- Skill gaps the agent reported, not applied so the candidate stays the one trialled: no route for an account with no installed copy; no guidance for two conflicting obligations; no guidance for an explicitly self-narrowed claim. Earlier (trial 1): state the claim being judged when the account gives none; how to treat a stand-in npm the Case's author controls.

## Owner decision

Independent review of whether this trial demonstrates the intended distinctions, and whether to accept it for C13. The Skill gaps above, an installed-copy scenario or a second reviewer are for a follow-up Change if wanted. This record grants no integration or release authorization.

## Limits

A trial of the Skill's ability to support judgment in three small scenarios, by an agent of the author's model family with residual structural hints it reported. It is not a deterministic proof of semantic completeness, and the judgments are reasoned and can be wrong. It evaluates Packaging's Skill, not any real package.
