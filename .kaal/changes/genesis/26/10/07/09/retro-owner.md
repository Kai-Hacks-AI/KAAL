# Retro

## Learned

Collection does not require KAAL to know every client. The distinction between known clients, reachable clients and all clients becomes reliable when collection records only actual attempts and their outcomes.

The first implementation also exposed an installation boundary: instance-owned collection records must survive reinstallation without being mistaken for package drift.

Building Collection alongside Incident and Request demonstrated that parallel Changes can progress independently, but their shared interfaces and Change addresses must eventually reconcile against admitted reality.

Finally, Reviewer independence matters operationally. The Worker initially appointed its own Reviewer, then withdrew those rounds and obtained independent review. The correction was necessary, and the resulting review identified a genuine defect.

## Liked

The adapter-neutral separation: the collecting agent obtains access through available adapters, while the Collection Skill operates only on exposed carrier directories.

The preservation of carrier bytes, source paths and hashes without interpreting their meaning.

The explicit recording of unsuccessful reachability attempts. KAAL can distinguish a client that was unreachable from one that was reached but had nothing to report.

The narrow scope. Collection does not become a registry, ticketing system, backlog or automatic Change generator.

## Lacked

A real end-to-end collection from an external KAAL client. Acceptance tests establish the mechanism, but actual client experience remains unproven.

A general understanding of instance-owned operational state within installation. Incident, Request and Collection each required the installer to recognize another directory. This repeated pattern deserves attention, but not a retrospective redesign of the current Change.

A clean way to preserve updated validation evidence after review convergence without reopening the sealed Work. The final green full-suite result is recorded on the PR rather than in Work.

## Longed

For a willing KAAL client to select Incident and Request, create real carriers, and make them available through an authorized adapter so KAAL can collect them.

For the Owner to evaluate those collected observations separately from the act of collection, preserving the distinction between evidence and decision.

For future external KAAL installations to demonstrate that this communication model works without assuming GitHub access, a central client registry or automatic submission.

And for the lessons about instance-owned state to inform a future Change only when further use justifies it.
