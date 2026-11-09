# Foundation Boundary Check: Intent

foundation/C13 is this PLAN. It ships no code. foundation/C14, its DO, turns the planned cases GREEN. It authorizes no synchronization, promotion, version change or npm publication: those stay with the Owner.

**Release scope (Owner decision, 2026-11-09).** Foundation 0.0.2 ships its Boundary Check, because Foundation is becoming the reference package and must do better than Hosting 0.0.1, whose Boundary Check is declared "not applicable". An earlier guidance that kept C14 off the 0.0.2 critical path is superseded by that decision. Publication still depends on the Owner's separate go.

**Design rulings (Owner, 2026-11-09), which replace the earlier consumer-boundary design of #747 and #1292's first head.**
- A boundary test finds things that should be owned by the package but may be done somewhere else. It points at files and folders. Hosting's scan is a version of that.
- A boundary test carries what it looks for. It never carries where it looks: whenever a target is added to the repository, no package may need a code change to see it. Targets are input.
- A finding is just a finding: an audit result, which belongs to Engineering and not to the package. What is decided because of a finding may well enter the package, as a Defect, a Requirement, or a change to Intent or Architecture, through a normal Change. The finding itself does not.
- A package never names a role. Who decides about a finding is the repository's, because roles change over time and a role written into a package becomes mandatory in every package.
- On a promotion the incoming package's boundary test challenges the existing packages and the consumer repository, and the existing packages' boundary tests challenge the incoming package. The sum is one list of findings, each against the place where it was found. The package proof point only runs the packages' own checks and collects what they report. It has no check of its own.

- **foundation/I9.** **Foundation can find, anywhere it is pointed, what Foundation owns being done somewhere else.** What Foundation owns here is the byte-level SHA-256 (foundation/I1, foundation/I2, and the digest-ownership position of foundation/C18: Sealing, Packaging and Process each build their identity on `@kaihacksai/kaal-foundation/sha256`; none copies the implementation and none uses `node:crypto` for a KAAL digest). The check reports each place as a finding and decides nothing: it never says a finding is a fault, never ranks it, and never turns "none found" into "compliant".

**Two axes.** A Boundary Check challenges package <--> package and package -> consumer repository. Foundation's check serves both by the same means: it is pointed at a package, or at the repository, and reports what it finds there. Hosting's boundary scan challenges Foundation in the other direction. It is Hosting's check, run by whoever promotes Foundation. It is not part of Foundation.

**What a finding is not.** A finding is a place to look at. A package that holds its own SHA-256 may have a reason, and a package that holds none may still compute a digest some other way the rules cannot see. The record of Foundation's check states these limits, and findings and the decisions about them are held in the repository as audit, never in the package. Only a consequence of a decision enters the package.

This PLAN changes nothing a consumer computes. `scripts/sha256.mjs` and `scripts/sha256.d.ts` stay byte for byte the same (foundation/N5, foundation/N9).
