# Packaging Readiness (LOVE): Intent

This is `requirements/C5`, a PLAN Change. It ships no code and no test file. It plans what Requirements needs before it can be offered as a reusable, independently versioned package: Lifecycle, Ownership, Verification and Encapsulation (LOVE). It follows the Owner's direction on #276 (comment 6419391393). Core manages structure, composition, installation and lifecycle. Requirements owns only its semantics: what a Requirement is, and its own reading of a placement (`requirements/C1`). Readiness is not authorization to publish. Publishing, and any package name or registry it needs, is a separate Owner decision.

#276 and #553 delivered `kaal-requirements`: the Capability Node `Requirements`, the Definition `Requirement`, an ownership claim and their tests. `requirements/C1` (#590) planned `Placement Observation`. The package ships Nodes only: no Agent Skill, no script and no runtime dependency. Measured against LOVE, it stands as follows:

| | Today | Gap |
| --- | --- | --- |
| Lifecycle | `npm install` and `kaal register` add it. Registering identical content again does nothing | There is no Installation Contract instance, so no installer can say what an installation of Requirements is. No Core path upgrades or removes a registered contribution: another version of the same name is refused, and `kaal remove` keeps it (Core, 2026-10-29) |
| Ownership | `Requirements` is typed `KAAL Capability` and claimed by name and id. The Node bounds it against Intent, Architecture, Code and Testing, and says a Change carries Requirements without defining them | Nothing states the boundary with a Defect, which Product records as durable prohibited behaviour (#583) and which reads like a Requirement stated negatively |
| Verification | unit tests of the Nodes' Form, type, admission and key statements, run in this repository | no Acceptance scenario installs the packed package into a consumer, and nothing checks a contract against Core's conformance Test Cases |
| Encapsulation | the package ships `capability/` and exports only `./package.json` | nothing checks that the packed package holds exactly its Nodes and declared files, or that the README names every Node a consumer may rely on |

- **requirements/I4.** Any installer that realizes Requirements' Installation Contract, Core or another, can install, upgrade and remove it, and every installation states its version. Removing it removes its machinery, never what a consumer recorded with it (`requirements/I3`).
- **requirements/I5.** Requirements is one Capability whose responsibility overlaps no other: it states what must hold. Intent says why, Architecture where, Code how, Testing whether it holds, Change carries Requirements, and a Defect's record is its owner's.
- **requirements/I6.** A consumer reaches Requirements only through its Nodes and its contract, and independent evidence, from a consumer that installed the packed package, shows that it holds.
