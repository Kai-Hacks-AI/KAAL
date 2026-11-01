---
name: kaal-change
description: Scope a proposed change, trace intent, functional and nonfunctional requirements, defects, architecture and tests, identify incoming and outgoing interfaces, and organize multi-loop TDD evidence. Use when planning an isolated change, reviewing its boundaries, or explaining missing evidence and effects outside the selected scope.
---

# Working on an isolated Change

Read the `Change`, `Change Isolation` and `Change Practice` Nodes where the consuming context makes them available. They state the capability's meaning and scope. This initial skill guides isolation; it provides no lifecycle, delivery or release decision.

## Bare

Start with the intended alteration and the evidence available. Explain which scope is proposed, what else may be affected, which interfaces cross the boundary and what remains unknown. Follow that procedure in ordinary conversation even when executable tools or a complete model are unavailable. Never turn missing evidence into an isolated verdict.

## Agent

Let the consuming agent's instructions point here when work involves scoping or changing behaviour. Discover the skill through the host's supported mechanism. Do not assume a skill installation path or rewrite the consumer's instructions as a side effect.

In Embed mode, use the consumer's existing KAAL context and governed interfaces. In External mode, keep the skill and its tools in the operator's environment and work against the separately managed target through authorized interfaces. External use does not install KAAL in the target or create its Engine, instructions or workflow files.

## Skill

1. **State the proposal.** Identify the intended outcome, the altered owner identities and the selected capability scope. Record the exact evidence versions. Separate the proposed selection from the potential impact inferred through traces.
2. **Trace the concerns.** Follow Intent through functional/nonfunctional Requirements and relevant Defects into Architecture, interfaces, Cases and realizations. Ask the concern owners for their meanings and sources. Record missing or stale evidence explicitly; do not invent absent relationships or certify repository coverage.
3. **Inspect the boundary.** Identify incoming drivers, outgoing collaborators and semantic references crossing the scope. Include affected surroundings even when they remain outside the selected implementation scope. Return an unsupported scope or unresolved interface for a decision.
4. **Arrange the testing loops.** Use Testing for architecture conformance, capability acceptance and implementation test-first. Establish discriminating RED evidence before implementation, then GREEN and refactoring. Drive the real subject through incoming interfaces; control outgoing collaborators with appropriate mocks or stubs. Include Defect regression Cases. Keep independent contract and real-integration checks: passing doubles cannot establish compatibility.
5. **Use the evaluator when inputs exist.** Supply the explicit proposal, pinned owner inventories and a Graph public view to the package's public isolation API. Read every finding and qualification. Treat unavailable evidence as unknown. The evaluator executes neither subjects nor tests; all emitted obligations remain not assessed.
6. **Report and revisit.** Use the [worksheet](references/worksheet.md). Distinguish model-scoped isolation, repository authority, observed test execution and Owner decisions. Bind actual evidence to the assessed versions and reassess when those inputs change. Leave repository admission and CI policy to the consuming context.

Read the [input and result guide](references/isolation.md) when preparing an executable model or interpreting an assessment. Keep an incomplete manual assessment useful without pretending it is an executable model.

## Script

From the installed skill directory, run the contained example with Node 24 or later:

```sh
node scripts/example.mjs
```

Install `@kaihacksai/kaal-change` in the operator environment and keep it resolvable from that directory. The package declares its Graph/Hosting verification providers as required production dependencies. The example calls the public API and prints three labelled controlled-model results: a complete model, an omitted interface and a newly affected external dependent. It reads no target repository and executes no target tests. A successful process exit means the example ran, not that a target is isolated or approved.

Use `@kaihacksai/kaal-change/isolation` for an actual supplied model, as described in the input guide. No Git-diff converter, generic JSON adapter, mock generator, test runner or CI gate is supplied by this anchor.
