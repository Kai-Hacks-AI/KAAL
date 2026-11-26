# release/C161: verify Succession and verify Overlap, two detective controls over the order of promotions

## Reason
Kai (26 Nov): first we need to understand how to manage dependencies between Changes and collectors reliably, before the merge queue is touched. Today the promotion order, "SYNC before the second of two", and shared files such as C82/C83 and the 2 December checks live in project memory and in PR text, not in files. KAAL lives in files. Change owns the succession edge (a Change B succeeds a Change A: a hard delivery prerequisite, declared by the successor, pinning the predecessor's exact bytes; change's PLAN, which this Change depends on). Release is the user of the edge: it judges, before a PROMOTION, whether the order holds. This Change is the PLAN of the two controls. It is detective only: no WIRE, no flag, no required check, no ruleset.

## The contract
Two entries, each a pure judgement over facts given as data, built on the controls adapter path (C154 shape: the check is wrapped, the reads and printing stay outside it):
- `05-src/succession/judge-succession.mjs`, control `release/CTL43` verify Succession.
- `05-src/succession/judge-overlap.mjs`, control `release/CTL44` verify Overlap.
Both read files only. The position and the kind of a collector come from its content, never from a pull request title, body or branch name (release/D19, C136).

## As a control
Two control records, `release/CTL43` and `release/CTL44`, each detective, each with its own Intent and its own delivery map row. Ids by hand; on a clash the newer change renumbers. Both are recorded as `designed` until the DO and the evidence exist.

## Acceptance expectations (each verdict on its own)
- verify Succession (CTL43): the facts are the succession edges stated by the Changes a collector carries, and what main holds of each predecessor. PASS when every predecessor of every carried Change is on main with exactly the bytes its edge pins. FAIL, named per edge, when a predecessor is not on main (the prerequisite is not delivered), or is on main with other bytes (the edge is stale: it is reported, never repaired). UNKNOWN when the edges or main's side cannot be read, or an edge pins nothing. Never PASS on an unreadable fact. A collector whose carried Changes state no edge passes with "no declared prerequisite", which is not a claim that none exists.
- verify Overlap (CTL44): the facts are, for the collector being promoted and for every other open collector, the paths it owns that main does not hold (the `own` set of CTL33 isolate Changes). PASS when no path is owned by two collectors. FAIL, one finding per path, naming both collectors, when two collectors own the same path: one must land first and the other must be synchronized. A collector whose own set cannot be read is UNKNOWN, never "no overlap". Detective: it reports, it gates nothing.

## Cases (parked red, ids by hand; on a clash the newer change renumbers)
- T1590: the succession entry passes when every predecessor is on main with the pinned bytes and for a collector with no edge; fails for an absent predecessor and for a predecessor whose bytes differ; does not pass an unreadable fact set. Behaviour, positive and negative.
- T1591: the overlap entry passes disjoint own sets; fails a shared path and names both collectors; does not pass an unreadable own set. Behaviour, positive and negative.
- T1592: each entry imports the adapter by the real relative specifier and `recognizeIntegration` recognizes it, with its own control id (CTL43, CTL44). Structure only.
All red until the DO.

## DO
Add the two entries and the two control records. The DO renames the parked Cases unchanged. Each Case is green with the package suite. The shape of an edge in the Cases is Change's: the Cases follow Change's PLAN once it is merged, by a small PLAN amendment here, never by changing an expectation in the DO.

## Order
Depends on Change's PLAN for the succession edge (a hard dependency: this Change's DO waits for it on `main`). Independent of release/C157 to C160 and of the merge queue.

## After it
ACT, PROMOTION, then evidence. A detective WIRE needs the Owner's go; enforcement (refusing a PROMOTION whose prerequisite is not on main) is a separate Owner decision, after the controls have been Tested and shown on real promotions.

## Left open (with a recommendation)
- Who supplies the facts of open collectors: the own sets of other collectors need their trees. Recommendation: Hosting supplies them as data (the list of open collectors and their trees), Release judges. Until then verify Overlap runs only where the facts are supplied and is UNKNOWN otherwise.
- Soft ordering and priority are not edges: Change's definition carries no priority, which is Product's. The CPO queue stays a human order until it can be derived.
- Whether the Dispatcher uses the derived order. Recommendation: later, with C136, and only after both controls are Tested.

## Not in this Change
No WIRE, workflow, flag, required check, ruleset change, queue change or batching. No change to the Succeeds definition: that is Change's.
