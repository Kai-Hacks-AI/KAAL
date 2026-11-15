# Hosting Usage Skill: Testing

These are the planned acceptance obligations for hosting/I14, F57–F62, N8 and A23–A25. This PLAN defines the cases; executable TDD follows its approval. No new RED/GREEN result is claimed here. Case numbers are provisional until admitted; T70 already belongs to ownership and is unchanged.

| Case | Loop / placement | Required observation |
| --- | --- | --- |
| hosting/T71 [hosting/I14, hosting/F57, hosting/F61, hosting/A23] | Architecture; publisher | Packaged general Skill exists, names itself correctly and passes the existing Engineer Skill checker. Copy its complete directory away from the package and repeat validation. Missing resources and an escaping relative reference are rejected. This establishes structure/portability only. |
| hosting/T72 [hosting/I14, hosting/F58, hosting/F61, hosting/F62, hosting/A24] | Intent; delivered | Extract and run the initialization/readback example from installed Skill resources in an owned scratch directory. Exact bytes are returned, and unrelated consumer content is unchanged. It imports Hosting by public scoped name, without source-tree access. |
| hosting/T73 [hosting/F58, hosting/F59, hosting/F62, hosting/A24] | Requirements; delivered | Run the shipped guarded-reconciliation example against a valid precondition, then a stale one. Success reports the intended change; stale rejects distinctly and preserves the unexpected bytes and unrelated content. No fallback unconditional write or hidden retry occurs. |
| hosting/T74 [hosting/F58, hosting/F62, hosting/A24] | Requirements; delivered | Run the shipped command example through `execute`; preserve argument boundaries, working directory, stdout/stderr and a nonzero child status. Preserve start failure distinctly. Do not introduce a shell or OS branch. |
| hosting/T75 [hosting/F60, hosting/F62, hosting/A25] | Architecture; publisher | Installed verification selects the new delivered Cases and inventories the Skill resources. Reuse T26–T31 for result, alteration, omission and skip semantics rather than duplicate their implementation. Record the exact packed bytes and installed location. |
| hosting/T76 [hosting/F59, hosting/N8, hosting/A24] | Code; publisher | Reuse existing stale/refusal/rollback/UNRESTORED/leftovers fixtures to challenge each recovery recommendation. A recommendation to overwrite stale bytes, erase recovery originals, collapse rollback failure into success or assert crash atomicity is rejected during recorded review. Mechanical fixture outcomes and reviewer judgments remain distinct. |
| hosting/T77 [hosting/F60, hosting/N8, hosting/A24] | Requirements; publisher | With existing verification/boundary fixture outputs, demonstrate exact result interpretation, including unknown verification and verified boundary cases with open review. A false GREEN or closed review without judgment is rejected. Prefer existing callable evaluators; semantic reading of prose is recorded validation, not a regex verdict. |
| hosting/T78 [hosting/F57, hosting/F58, hosting/F59, hosting/F60, hosting/F62] | Intent; recorded agent validation | Give an agent only the installed/relocated Skill, ordinary task inputs and an isolated consumer. Observe operation selection, use of public APIs, preservation of unexpected content, and escalation on missing authority/evidence. Assess trace/transcript and output against the frozen contracts, separately from deterministic test results. No expected operation or answer is leaked through the evaluation prompt. |

## TDD and challenges

After PLAN acceptance, freeze the executable outer tests before DO. Demonstrate an assertion RED for absent Skill/resources and each new workflow obligation, then GREEN against the same assertions. Missing imports, syntax errors and setup failures do not substitute for behavioral RED. New evidence must not come from editing assertions to match an implementation.

Designate negative challenges before DO: omit a referenced resource; escape the relocated Skill; execute a different copy of an example; overwrite on stale; drop a nonzero child status; claim `cannot verify` as verified; close an unresolved boundary review; delete a retained recovery original. Record whether each is killed by an assertion or rejected by independent validation. Do not describe a prose check as an executed host-operation test.

Use the actual candidate tarball and fresh consumers on Linux, macOS and Windows. In a Testing acceptance scenario, obtain packages only through `install` from the caller's once-packed manifest; never pack/build inside a scenario. Retain host containment and unrecorded-installation limitations as unknown where the harness cannot establish them. No new OS-specific registration, weakening or skips.

## Owner acceptance evidence

Return the accepted PLAN and frozen-case identities, exact head/tree/tarball digests, the packaged file inventory, checker and relocation results, RED/GREEN and negative-challenge records, three-host publisher/consumer results, existing regression results and separately recorded guidance/agent validation. Reuse current T24–T31 and boundary fixtures. Report unrun obligations explicitly. All required GitHub checks and independent Owner review remain necessary.

Only after this Skill delivery and the separate dependency/integration blockers are resolved can the final Hosting release candidate be assessed. Repository GREEN, installed verification, promotion and npm publication are separate evidence boundaries.
