# Core/C50 PLAN: independent discovery and optional composition in consumer acceptance

Logical Change core/C50, numbering rejudged at integration. It answers the CPO
recommendation of 3 November 2026 (CPO to CTO handover, section 3): Core's
consumer acceptance should show independent capability discovery and optional
composition. It is a recommendation for Core 0.0.1's acceptance, not a scope
expansion: no new package, capability, export, command or registered kind.

## What Core already shows

- A missing complement is unavailable, not an error (core/F80); cycles read
  "unavailable" without Graph, and verify never fails on Graph's absence or on an
  untraced instance. Core has no runtime dependency on Graph.
- Registration assembles several independent scopes into one result under the
  trace rules, so an Engine exposes the ingredients without Core implementing a
  domain function.
- The installed package registers a Skill and an Extension, lists the
  capabilities, and keeps identity, resolution and discovery when the Engine is
  rearranged.

## The gap

The scopes are fixtures inside Core's own tests. No scenario takes the packed
Core into a clean consumer and shows that independently delivered capabilities
become discoverable, and compose, without changing Core.

## The scenario (RED cases come after review of this PLAN)

In one clean consumer installed from the packed Core, using fixture capabilities
only (two scopes that know nothing of each other, named for the pattern, for
example a portfolio-like scope and a project-like scope):

1. Register capability A alone. Discovery lists A and states that no
   complement is present. Nothing fails.
2. Register independently delivered capability B afterwards. Discovery lists A
   and B and exposes the ingredients their composition needs. Core did not
   implement the composed function.
3. Remove B. Discovery again lists only A and states the absence honestly.
4. Register B alone, in a second clean consumer (or after removing A in the
   same one). Discovery lists B, verify succeeds, and B's own result is the same
   as when A is present. A fixture B that secretly needs A fails here.
5. Throughout, Core's installed files and their manifest digest are byte
   identical: adding or removing a capability changed nothing in Core.
6. Each capability is useful alone: A's own verify result is the same with and
   without B, and B's is the same with and without A (states 1, 3 and 4).

### The composition result the scenario consumes

Coexisting in discovery is not yet composition. The scenario therefore also runs
one minimal, deterministic fixture-consumer operation through Core's existing
registration assembly (no new interface, no domain meaning). A third fixture
scope, owned by the consumer and registered only for this operation, has one
instance whose trace targets one fixture instance owned by A and one owned by B,
which the trace rule permits. A and B themselves state no trace to each other, so
states 1, 3 and 4 above are unaffected.

- With A, B and the consumer's scope present, the assembly resolves both traces:
  the result lists all three scopes, reports zero findings and shows the two
  resolved traces.
- With B absent (A and the consumer's scope present), the trace to B is a
  reported unresolved target that names B, not a crash and not a silent pass;
  A's own result is unchanged.
- With the consumer's scope removed, A's and B's results are the standalone
  results of states 1, 3 and 4.

The exact result fields are fixed when the RED Cases are written, from the
assembly result Core already returns. What this PLAN fixes is that the results
with and without B differ in the resolved trace and nothing else, and that no
Core file is touched to make them differ.

The five levels stay distinct in what is asserted: installation, registration,
admission and discovery are checked deterministically. Actual use by an agent is
not a deterministic property; only the installed navigation text (C49) touches
it, and this PLAN states that limit rather than faking a test.

## Boundaries

- Core adds no registered kind, export or command for this. Any gap the RED cases
  find is raised as a separate PLAN, not fixed in passing.
- BRAIN, Portfolio, Project and Product semantics belong to their capabilities;
  no fixture claims them. The fixtures prove Core's registry, not a domain.
- Test paths and identifiers are allocated when the RED Cases are opened;
  existing tests are not amended (immutable-test boundary).

## Evidence required at DO

- Intended RED: the clean-consumer scenario does not exist before the DO.
- GREEN: the scenario passes from the packed tarball on Linux, macOS and Windows
  with one Foundation, no nested copy, and Core's manifest digest unchanged.
- Negative: removing the digest assertion or editing a Core file between steps
  must fail the scenario.

## Sequencing

Stage 2 (mandatory initialization) is unaffected. This belongs to Stage 4, final
qualification, and runs on the packed artifact beside the existing installed-
consumer cases. It does not delay Core 0.0.1 and grants no integration, SYNC,
promotion or publication.
