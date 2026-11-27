# C163 change

## PLAN

1. Record the intent I31, the Requirements F218 to F223, the architecture A214, the control record CTL6 (detective, designed) and the Cases T1713 to T1722 (plain `.test.mjs`, never renamed). Each Case is RED on the collector, because the file it loads is absent, and was run GREEN against a throwaway implementation that is not committed.
2. No script, Skill word or workflow changes in the PLAN.

## The shape (Kai's model)

1. `scripts/lib/contract.mjs`: the verdicts and the content-identity rule (opaque, as testing/C84), importing nothing (F218).
2. `scripts/lib/judge-mode.mjs`, `scripts/lib/run-control.mjs`: the fixed steps evaluate, evidence, verdict, with a named strategy handed in by the caller (F219).
3. `scripts/lib/ratchet/`: the ratchet library, a sibling, the first strategy. The controls library never imports it (F220, A214).
4. `scripts/adapter.mjs` is the composition root: it hands `{ ratchet }` to the library and still accepts mode `ratchet`. Old paths stay as deprecated shims (F221).
5. `controls/CTL6` verify Ratchet use: a ratchet that does not use the library is a finding (F222).
6. `scripts/lib/collect-evidence.mjs`: one pure reader of `kaal-control` lines and one ledger format, the examined-identity check inside (F223). Release declares its counts; running it on each completed check run as an event is a Release WIRE on the Owner's go.

## DO

Not authorized by this PLAN. On its merge into the collector, and with C158 to C162 on main and the collector synced with main:

1. The files above, the shims, the `files` entries and one paragraph in the references that own the contracts.
2. Cases T1713 to T1722 GREEN; the package suite GREEN, with the new Cases counted.
3. Mutation patches with a runner for each weakening: the library imports the ratchet, an invalid strategy answer accepted, mode ratchet accepted in the library, the shim pair not self-contained, a ratchet with unknown observation allowed, a record of another identity than the examined one counted, a duplicate identity counted twice.

## ACT

A retro entry in the collector.

## Design questions, with the recommendation taken unless the Owner says otherwise

1. **Where the identity rule lives.** The approved testing/C84 is source-agnostic: an opaque non-blank string, compared exactly, no format. `lib/contract.mjs` holds the same rule; Hosting C118 provides the identity (contentIdentity, Git only as provenance). N8 forbids depending on Testing, so the rule is stated here and a drift Case can pin it later.
2. **Strategy slot.** The caller passes `strategies` (name to `{ judge }`); the library never looks one up by itself. The composition root is `scripts/adapter.mjs` and the command at `scripts/judge-mode.mjs`.
3. **Shim lifetime.** The old paths stay until Engineering C45 and Release's T1431 no longer fetch them. `ratchet.mjs` and `judge-mode.mjs` stay a self-contained pair, because T1431 fetches only those two.
4. **Mode `ratchet`.** Accepted at the public entry only, read as preventive with strategy `ratchet`. In the library it is UNKNOWN, blocked, `no-mode`.
5. **CTL6 baseline.** The ratchets that compute their own allowance today are adopted by Release in its own Change. Wiring and blocking are the Owner's go.
6. **Strict identity in execution.** Stated in F218 items 5 to 7: the end state is that every ratchet comparison and evidence record is bound to the identity of the examined content; the transition is named; the strict adoption is a separate Change gated on hosting/C118, and this restructure is not npm-ready until it is on main.
7. **Evidence collector.** Release declares per-check counts and swap criteria; Controls owns the reading and the format.

## Not here

No DO, WIRE, flag, workflow, baseline adoption, required check, ruleset, npm publish or change of `private`. The ratchet against a raw `GITHUB_SHA` and the shared-token ratchet (AID) are a later PLAN.

## PLAN record

On this tree the ten Cases T1713 to T1722 are RED, each because the file it loads is absent (T1718 because the shim marker is absent), and the 116 Cases that exist stay GREEN. They were run GREEN against a throwaway implementation in a scratch copy that is not committed (the throwaway suite had one expected difference: T591, which pins `files` to `["skills"]`, must take the `!` entries in the DO, as C160 does on its collector). The DO moves the old paths to deprecated shims and keeps the pair `ratchet.mjs` and `judge-mode.mjs` self-contained for release/T1431.

## End state and acceptance (CPO hold)

The intended contract is in F218 items 5 to 7: every ratchet comparison and evidence record is bound to the identity of the content actually examined, not a Git revision or a label. What this Change delivers is the rule, the collector and the CTL6 ratchet, all in identity terms. What stays transitional is named: `executed`, `findEvidenceDue` and `runAdapterRatchet` keep `revision`. Acceptance of the strict adoption (a separate Change, gated on hosting/C118 on main): no evidence function accepts an unnamed or non-matching identity, one Case each, and the `revision` parameters are gone or deprecated shims. The npm publish waits for it and remains a separate Owner go. No DO, WIRE or publish is authorized here.
