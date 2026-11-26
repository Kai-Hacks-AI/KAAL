# C18 DO

## Implement

- `skills/kaal-architecture/SKILL.md` is a router of 147 body words (the frontmatter, unchanged, is not counted; the target is 200). It states what Architecture describes, the two concerns, the test, the split-or-ask rule and the three parts of a report in a few lines, and names four references by their relative paths.
- `skills/kaal-architecture/references/` holds the detail, moved from the previous Skill: `concerns.md`, `unclean.md`, `report.md` and `scope.md`.
- The Test Cases that read the Skill read it as an agent does, through `skillText()` in `test/lib.mjs` (the router and every reference together): T14, T15, T18, T19 and T20. What they assert about the Skill is unchanged. T15 drops its 120-line limit and keeps its word ban, now over the whole Skill. A2 says router and references.
- T30 (F19) and T31 (F20) are `.red.mjs` renamed `.test.mjs` and moved beside their Requirement.
- Three Test Cases of the earlier trials (T1, T9 and T11) assert that the recorded prompts hold the Skill that was trialled. The Skill has changed, so the trial's own copy is kept as `00-changes/C1-classification/trial/skill-as-trialled.txt`, byte for byte the previous `SKILL.md`, and the two trial `lib.mjs` read it. Their assertions are unchanged. This is the one change outside the Skill and its Cases, and the reviewer should look at it.

## Mapping of the previous Skill to the new places

| Previous section | Now |
| --- | --- |
| Opening paragraph: the target state of a plateau, whether final or intermediate; two concerns kept apart | Router, first paragraph; the scope sentence is also the start of `references/scope.md` |
| "It prescribes no notation, tool or procedure, and it stays within the target state of one plateau" | `references/scope.md`, Scope |
| The two concerns (Solution, Delivery) | `references/concerns.md`, with a one-line statement in the router |
| The test, and "judge by the concern each part constrains" | `references/concerns.md`, with the test in the router |
| When a statement does not sort cleanly: Mixed, Constraint across the line, Ambiguous, and "raise each of these before design proceeds" | `references/unclean.md` unchanged; the router keeps "split a mixed statement, ask about what cannot be sorted, never guess" |
| What to report: parts, finding, next move, and "keep the report short" | `references/report.md` unchanged; the router names the three parts |
| Scope: travel between plateaus and delivery belong to other capabilities | `references/scope.md` |
| Rules: classify by the concern constrained, never guess, no third concern, no organization, domain or technology | `references/scope.md` unchanged |

Every sentence of the previous Skill is in a reference unchanged, with two exceptions that the reviewer should check. The opening paragraph is split: its first and last sentences open `references/scope.md` (joined with the first sentence of the previous Scope section, which they replace), and its two middle sentences (the two concerns kept apart, and what the Skill covers) are restated in the router. The router is otherwise new text that restates the opening in fewer words.

## Refactor

None. No record of any package other than A2 changes, and no Control or gate is added. The Skill is not deployed or published.

## Result

See `evidence.md`.
