# release/C161: verify Succession and identify Change Conflict, two detective controls over the order of promotions

## Reason
Kai (26 Nov): first we need to understand how to manage dependencies between Changes and collectors reliably, before the merge queue is touched. Today the promotion order, "SYNC before the second of two", and shared files such as C82/C83 and the 2 December checks live in project memory and in PR text, not in files. KAAL lives in files. Change owns the succession edge (a Change B succeeds a Change A: a hard delivery prerequisite, declared by the successor, pinning the predecessor's exact bytes; change's PLAN, which this Change depends on). Release is the user of the edge: it judges, before a PROMOTION, whether the order holds. This Change is the PLAN of the two controls. It is detective only: no WIRE, no flag, no required check, no ruleset.

## The contract
Two entries, each a pure judgement over facts given as data, built on the controls adapter path (C154 shape: the check is wrapped, the reads and printing stay outside it):
- `05-src/succession/judge-succession.mjs`, control `release/CTL43` verify Succession.
- `05-src/succession/judge-change-conflict.mjs`, control `release/CTL44` identify Change Conflict.
Both read files only. The position and the kind of a collector come from its content, never from a pull request title, body or branch name (release/D19, C136).

## As a control
Two control records, `release/CTL43` and `release/CTL44`, each detective, each with its own Intent and its own delivery map row. Ids by hand; on a clash the newer change renumbers. Both are recorded as `designed` until the DO and the evidence exist.

## Acceptance expectations (each verdict on its own)
- verify Succession (CTL43): the facts are the Change records of `main` and of the collector being promoted (`{ identity, text }`), and the derivation of a pin. The control calls Change's `readSuccession(records, { pinOf })` (change/C15, #2709) and does not re-read the format. An edge is `{ change, pin, because }`, stated by the successor only. PASS when the reader returns no finding and every predecessor is on `main` or carried by the same collector: a predecessor that only another open collector holds is not delivered. FAIL, named per Change and predecessor, for each finding the reader returns (`not-hard`, `malformed`, `duplicate`, `unresolved`, `stale`, `cycle`, `derived-stated`, `overlap-stated`) and for a predecessor held only by another collector. `stale` is reported, never repaired. UNKNOWN when the records or the pin derivation cannot be read; never PASS on an unreadable fact. A collector whose Changes state no edge passes as "no declared prerequisite", which is not a claim that none exists.
- identify Change Conflict (CTL44): the facts are, for the collector being promoted and for every other open collector, the paths it owns that main does not hold (the `own` set of CTL33 isolate Changes), and the valid edges of Change's reader (`successors`). A path owned by two collectors is a conflict. PASS when no path is owned by two collectors. A conflict between two collectors that a declared edge orders (one Change succeeds the other) is reported as `ordered`: the earlier lands first and the later is synchronized, and it does not fail. A conflict no edge orders is a FAIL naming the path and both collectors. A collector whose own set cannot be read is UNKNOWN, never "no conflict". Detective: it reports, it gates nothing.

## Cases (parked red, ids by hand; on a clash the newer change renumbers)
- T1590: the succession entry passes when every predecessor is on main with the pinned bytes and for a collector with no edge; fails for an absent predecessor and for a predecessor whose bytes differ; does not pass an unreadable fact set. Behaviour, positive and negative.
- T1591: the Change Conflict entry passes disjoint own sets, reports a conflict that a declared edge orders as `ordered` without failing it, fails an unordered shared path naming both collectors, and is UNKNOWN on an unreadable own set. Behaviour, positive and negative.
- T1592: each entry imports the adapter by the real relative specifier and `recognizeIntegration` recognizes it, with its own control id (CTL43, CTL44). Structure only.
All red until the DO.

## DO
Add the two entries and the two control records. The DO renames the parked Cases unchanged. Each Case is green with the package suite. The edge shape is Change's, `{ change, pin, because }`, and the Cases below use it. If Change's PLAN amends the shape, the Cases follow by a small PLAN amendment here, never by changing an expectation in the DO.

## Order
Depends on Change's PLAN change/C15 for the succession edge (PR #2709, collector `kaal/change/succession`): a hard dependency, so this Change's DO waits for it on `main`. Case ids are per package: change/T1557 to T1562 and release/T1590 to T1592 do not collide, and no id is renumbered. Independent of release/C157 to C160 and of the merge queue.

## After it
ACT, PROMOTION, then evidence. A detective WIRE needs the Owner's go; enforcement (refusing a PROMOTION whose prerequisite is not on main) is a separate Owner decision, after the controls have been Tested and shown on real promotions.

## Left open (with a recommendation)
- Who supplies the facts of open collectors: the own sets of other collectors need their trees. Recommendation: Hosting supplies them as data (the list of open collectors and their trees), Release judges. Until then identify Change Conflict runs only where the facts are supplied and is UNKNOWN otherwise.
- Soft ordering and priority are not edges: Change's definition carries no priority, which is Product's. The CPO queue stays a human order until it can be derived.
- Whether the Dispatcher uses the derived order. Recommendation: later, with C136, and only after both controls are Tested.

## Not in this Change
No WIRE, workflow, flag, required check, ruleset change, queue change or batching. No change to the Succeeds definition: that is Change's.
