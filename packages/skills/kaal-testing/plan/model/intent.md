# Testing Model: Intent

This is `testing/C14`, a PLAN Change. It ships no code. `testing/C15` turns its planned tests GREEN.

It answers two Owner directions:
- the review of #385 (comment 6489540871): Testing defines the Strategy → Plan ↔ Suite ↔ Case kinds, their identity and relationship rules, and their result mechanics; each consumer owns its concrete instances; a Case owns an outgoing **tests →** trace to its subject; history and acceptance policy stay apart; FAR is Change's composition of ordinary Plans;
- the Owner alignment on #583 (comment 6495452330): Strategy → 1..n Plans, Plan ↔ Suite n..m, Suite ↔ Case n..m, with Testing formalizing relationship ownership and multiplicities. This PLAN does that. The alignment's Runs, provenance, retention, Test Data and retired Cases are planned separately in `testing/C18`;
- the Owner clarification in the #kaal research thread on maturing `kaal-testing` (2026-10-28 17:16 CET): each Capability defines its own concepts, identity rules and outgoing trace rules; incoming traces are never declared by the receiver, only derived; an open Testing trace rule must not prescribe other Capabilities' kinds; there is no mandatory universal tree or schema.

What exists, and what this Change does not repeat:
- A Case's identity is `<capability>/T<n>` (testing/N2, `testing/C4`).
- Observed outcomes come from an observed run (`testing/C4`, `testing/C8`). This Change reads outcomes as given data and observes nothing itself.
- testing/F13 (`testing/C9`) already gives consumer verification failed, unknown and verified, with a skipped or unrun case unknown.
- No Strategy, Plan or Suite kind exists. Each Change's `plan/<topic>/testing.md` is a Plan in practice, written for people.

The Intents:

- **testing/I10**: Testing owns only Testing's kinds. It defines Strategy, Plan, Suite and Case, their identities and their relationships, and nothing of any other Capability. A product declares only the levels it uses, and owns its instances. A Case's **tests →** trace points out to a subject whose kind and meaning belong to that subject's Capability. Who tests a subject is derived from these outgoing traces, never declared by the subject.
- **testing/I11**: Each Case, Suite and Plan has an explicit result, and nothing is read from silence. A Plan's acceptance follows an explicit policy that its caller supplies, never one inferred from a baseline. A Case the policy allows stays failed. Comparing runs is history and observation, and it changes no result.

## A contradiction with current contracts

TEST A FINDING (`testing/C6`, Testing's Agent Skill) names a closed list of permitted target kinds: Architecture, Functional requirements, Intent, Nonfunctional requirements, Defects. Those are other Capabilities' kinds, and a closed list prescribes them. Under testing/I10 the rule is open, so `testing/C15` turns the list into guidance for KAAL's own loops: a Test Case normally traces to one subject, and the Skill recommends these kinds without restricting them.

testing/N2's `<capability>/T<n>` is KAAL's internal convention for KAAL's own Cases, not part of the Testing kind. The generic model leaves a Case's identity to its holder (testing/F24), so an external product keeps whatever identities it already uses. Uniqueness within one model is the only intrinsic rule, because references must resolve. (Owner review 5696234641 on #601.)
