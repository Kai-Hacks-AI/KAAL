# Hosting sibling footprint: proposed contract reconciliation

Date: 2026-11-02. Base: `23796c9` (#826 admitted). Proposed semantic PLAN `hosting/C28`; its number is provisional. Owner product review is required. This file is a proposal only: it changes no authoritative Requirement, runtime, Skill, public API, Core definition, permission policy or release decision.

## Conflict requiring a decision

hosting/F5 says “Nothing is ever written or removed outside `root`.” hosting/A2 and A21 intentionally stage beside the target; F11 and F12 explicitly place kept originals and leftovers there. `proper-lockfile` also creates `<canonical-root>.lock`. The usage Skill already requires authority for that footprint. A literal root-only authorization cannot cover sibling writes. Passing containment tests or a broad filesystem permission does not establish caller authority.

The 2026-11-02 Owner direction authorizes preparation of this amendment, not independent self-approval. Do not silently weaken F5 or implement a new generic boundary/permission framework.

## Proposed amendment for independent review

Retain F5's existing link refusal and `INVALID_PATH`/`EXISTS` rules. Replace only its final sentence with:

> The caller's relative reconciliation paths designate changes only inside `root`; an escaping path is refused before publication. Hosting's writer machinery additionally creates its lock and uniquely named staging/aside directories beside the canonical root, as hosting/A2, A21, F11 and F12 describe. The caller must have authority for that complete footprint before requesting a write. This requirement grants no authority and adds no runtime permission-enforcement API. Kept recovery originals and reported leftovers remain governed by F11 and F12.

The existing limitations on canonical versus physical containment, uncooperative writers, reader visibility and crashes remain explicit. Do not use this amendment to authorize an arbitrary sibling target, weaken portable-path or link refusal, delete recovery originals, auto-retry stale writes, broaden cleanup ownership or assert stronger atomicity. Handling root aliases remains the accepted runtime's behavior; any change to those semantics needs its own explicit review.

Align the authoritative Requirements/Architecture/Limitations and general Skill only after the Owner accepts the meaning. The Skill's authority check remains a precondition for agent action, not a claim that a JavaScript library can infer the user's authorization.

## Frozen acceptance obligations proposed for subsequent TDD/DO

1. An escaping consumer path is refused and both the root and unrelated siblings remain byte-for-byte unchanged.
2. Successful reconciliation changes only its declared root paths and transient named writer machinery; no machinery remains when cleanup succeeds.
3. An observed apply failure preserves the existing rollback outcome. Failed rollback retains every displaced original in `kept`; cleanup refusal reports each leftover without changing the outcome.
4. The aside-allocation regression established in the separate defect Change cleans staging or reports it while preserving the original failure. This PLAN does not duplicate or weaken that test.
5. Independent agent validation: a task authorizing writes strictly inside root must be held for missing sibling-footprint authority before any mutation; adequate explicit authority permits only the requested operation. Preserve the transcript and actual artifacts. This is qualitative validation, not a regex verdict or a new runtime authorizer.
6. Challenge advice to treat staging as implicitly authorized, to use an arbitrary sibling destination, to erase `kept`, or to claim unconditional outside-root immutability. Each must be rejected in recorded independent review.

Run real packed/installed tests on Linux, macOS and Windows after the accepted amendment's DO. Native host execution, deterministic verification, agent validation and independent Owner judgment are separate evidence. No new platform skip or release waiver is proposed.

## Boundary and remaining work

This PLAN selects Hosting only. It does not retype Hosting's existing Extension Node or rewrite Core CASE. Shared boundary/BASS design is separate. Existing Packaging exact-version, Operations-document, model/manifest/result interoperability gaps stay recorded with the cited accepted-contract status; they are not waived here. Complete remaining owned compatibility preparation, governed SYNCs, final focused promotion review and separately authorized registry release acceptance remain prerequisites.
