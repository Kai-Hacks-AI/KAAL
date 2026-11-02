# Trial record: packaging/T51 and packaging/T52

## Candidate and inputs

- Skill under trial: `skills/kaal-packaging/SKILL.md` at commit `96d99b1` (the Skill section "Assess a package's boundaries"), with the shipped docs and README at that commit. The Skill was not changed after the trial began.
- Supplied material: the three scenario files in this directory (`scenario-1-adequate.md`, `scenario-2-omission.md`, `scenario-3-unsupported.md`). Scenarios and `expected.md` were written and committed in `96d99b1` before the trial ran, and `expected.md` was not shown to the agent.
- The package `acme-sizer` is hypothetical. No installed copy, `test/verify.json` or fixtures exist, so no script could be run on it.
- Run: 2 November 2026, one fresh general-purpose agent, no Engine, instructed to follow the shipped Skill only.

## Independence

The agent was a separate session that received none of this session's context and none of the guidance author's reasoning. It is the same model family as the author, and was not human or from another vendor. Limits: the scenario file names ("adequate", "omission", "unsupported") hint at the intended outcomes, and the agent saw the `docs/testing.md` row for packaging/T51 in a grep, which describes the three expected outcomes. The agent reported both leaks itself. A stronger trial would use neutral file names and withhold that row.

## Inspection choices and tool observations

The agent read the Skill, `README.md`, `docs/requirements.md`, the three scenarios, and grep excerpts of three other docs. It ran no scripts on an acme-sizer copy and named the ones it would run on a real installed copy: `conform ... --testing ... --work ... --json` and `measure`, plus reading `test/verify.json`, `package.json`, the fixtures and the stand-in npm scripts. Script observations are therefore none in this trial; the judgments below rest on file inspection of the accounts.

## Agent judgments

Compared with `expected.md` (set beforehand):

- **Scenario 1 (adequate): matches.** It judged the account adequate for the Linux, Node 24.22.1 claim, walked each obligation to a Case with a success and a refusal, noted macOS and Windows are not claimed, and listed weaknesses it could not resolve without fixtures (T5's listing diff may miss writes outside the working directory, T2 bundles three refusals) as owner test content, not failures.
- **Scenario 2 (material omission): matches.** It found that B4's two refusal obligations (path outside the working directory, never overwrite) have no Case, that T7 covers only the success path, that a broken implementation would still verify, and that this is the security-relevant gap. It said the passing T1–T7 run does not evidence B4's refusals, and that `conform` would not detect it.
- **Scenario 3 (unsupported claim): matches.** It named the CI run's different artifact (`1.2.1-rc`, different digest) and Node 22 on Linux, the truncated Windows log, and macOS running the source suite not the installed verification. It kept macOS and Windows unresolved, said CI #418 should not be cited for the candidate, and noted only the local Linux, Node 24 run supports a narrower claim.
- It kept observations, judgments, unknowns and Owner decisions apart in every scenario, did not claim proof, and left each package's tests and Hosting's platform questions with their owners.

## Unresolved unknowns

- Whether another agent, or a human, would draw the same lines on borderline weaknesses; the agent itself noted two reviewers could differ on T2 and T5.
- Whether the Skill works when an installed copy exists and `conform` is actually run; this trial had none.
- The agent's candid feedback on the Skill, not yet acted on: it does not say how to proceed with only a written account and no installed copy; it does not say to state the claim being judged when the account gives none; it does not say how to treat a stand-in npm the Case's own author controls.

## Owner decision

Independent review of whether this trial demonstrates the intended semantic distinctions, and whether to accept it for C13. Any strengthening (neutral names, withheld T51 row, an installed-copy scenario, a second reviewer) and the three Skill clarifications above are for a follow-up Change if the Owner wants them. This record grants no integration or release authorization.

## Limits

This is a trial of the Skill's ability to support judgment within three small scenarios. It is not a deterministic proof of semantic completeness, and the agent's judgments are reasoned and can be wrong. It evaluates Packaging's Skill, not any real package.
