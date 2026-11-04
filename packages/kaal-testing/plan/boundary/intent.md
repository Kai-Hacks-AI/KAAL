# PLAN Boundary Integrity: Intent

This is `testing/C11`, a PLAN Change for C-T2. It ships no code. `testing/C12` turns its planned tests GREEN.

**What the Owner set.** C-T1 (#282) states that every PLAN-established test is immutable to DO and CHECK, together with the fixtures, expectations, configuration and helpers that give it its meaning. The Owner's alignment on C-T2 in #kaal (2026-10-27) sets four things:
- **The invariant.** PLAN establishes an immutable acceptance boundary before DO.
- **Two realizations of one contract.** A separate PLAN Change, with Git history and Change Isolation, and PLAN → trusted Seal, with Sealing's integrity service, possibly in one Change.
- **Three kinds of claim, kept apart.** Byte integrity, execution reproducibility and behavioural validity are different claims. An `ok` Seal is not proof of intended RED, correctness or Outcome, and unknown coverage stays unknown.
- **Owners.** Concern owners own content, Testing evidence semantics, Sealing integrity, Change the PLAN baseline, and Engineering execution and gates.

**What the Guard lanes showed** (kaal/guard, #290 to #510). This is the evidence behind the fixtures:
- **Planned tests changed after PLAN without a mechanical stop:** C35/C36, C56, C58/C59, C85, and #298, #299, #303, #307.
- **A sync carried a PLAN file back in, and a person caught it:** #500, C90.
- **A lost executable mode:** guard/D5, C40 to C42.
- **Line endings changed a working tree's bytes:** C57 and C65.
- **Meaning lived in another Capability's format:** C56.

- **testing/I8.** Whichever realization a PLAN uses, Testing reads its result the same way:
  - a change to the declared boundary is a verified failure naming its owner and path;
  - an untouched boundary is "unchanged within the declaration", never "met";
  - whatever the realization did not compare stays unknown.
- **testing/I9.** Testing interprets and never produces the result. It imports neither Git nor Sealing. It keeps no registry and names no gate.
  - Testing interprets a verdict that a trust authority attests. It never authenticates one, and a verdict's own labels never make it trusted. Whether the candidate could rewrite the anchor, and whether the comparison was made, stays the authority's: Engineering's, and Sealing's for a Seal (`testing/C19`).

## Amendment

`testing/C19` amends this PLAN after the Owner's review 5699917160 on #617 (`testing/C12`). As planned, `interpret` trusted a verdict on its own labels, such as an anchor of kind `plan-commit` and `bytes: "stored"`. Those labels cannot show that the candidate cannot rewrite the anchor or that the comparison was made. Now:
- `interpret` takes the trust authority's attestation, bound to the verdict's anchor, as a third input. Without it, the verdict is unknown, and its changes are reported but are not verified failures (testing/F20, testing/T40).
- A change entry that does not read, an unrecognized change to a declared path, or outside paths that do not read leave the class `unknown`, never `unchanged within the declaration` (testing/F23, testing/T41).
- testing/T20 to testing/T25 read each verdict with its attestation, and assert what they did before.
