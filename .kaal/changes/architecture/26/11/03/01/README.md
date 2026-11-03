# Architecture PLAN: package independence in placement guidance

Owner: Architecture. Target: kaal/architecture. Ordinary working Change (documentation only);
record numbering is provisional until integration (proposed `architecture/C13`).

PLAN only. No Node, Skill, Definition, claim, package or policy changes. Nothing is synchronized,
promoted or published.

## 1. Intent

Kai's technical guide (3 Nov): packages should ideally be independently deployable, so a consumer can
operate with one only. Each package should hold the potential that several together enrich the
capabilities (1 + 1 > 2). Hard dependencies should be avoided where possible, and that is never an
allowance to duplicate technical answers. This PLAN states how Architecture's placement guidance
applies it.

## 2. What already holds

`architecture/C8` (#588) already plans the same shape for Requirements: no dependency of any kind on
`kaal-requirements` (`architecture/N3`), nothing fails when it is absent or removed (`N4`), and
`Placement` citations enrich a decision when Requirements is present (`I4`, `I5`, `I6`). The guide
generalizes that case to every placement decision.

## 3. Placement guidance (principles the Skill and Node will carry)

- **architecture/G1 Independent first.** A placement decision should leave each package usable alone.
  Where a decision would make one package require another, the decision says why that hard dependency
  is unavoidable. A hard dependency is the exception and carries its grounds.
- **architecture/G2 Composition is optional enrichment.** Where several packages together do more, the
  decision places that as optional composition: found by name in the same Engine, absent without error,
  stronger when present. No pinned pair, composition registry or third integration package.
- **architecture/G3 Independence never licenses duplication.** The owner of a technical answer keeps it.
  A package that needs that answer uses it (URBAN Use), through the owner's contract, when the owner is
  present. A copy of the owner's answer is not an independence mechanism. When the answer must be
  available without the owner, the decision records Adapt or New explicitly and why a shared answer
  cannot be used, so that "avoid a dependency" is never the silent reason for a second implementation.
- **architecture/G4 Existing examples keep their ownership.** Core's delivered Node support (a byte
  copy of Graph's contract, `core/I24`) is such a decision, owned by Core and Graph. This PLAN neither
  reopens nor endorses it. Engineering coordinates any cross-package duplication finding.

## 4. How it lands

1. This PLAN (`architecture/C13`).
2. The Skill section and the one-sentence Node addition that carry G1 to G3 join the held `Placement`
   work (`architecture/C9` to `C11`), because they share the same files. They wait for the decisions
   already recorded on #891: Intent and Requirements ownership, Hosting route, Kai's go.
3. No other capability's documents change here. Each owner applies the guide to its own packages.

## 5. Decision for Kai

Confirm that G3 requires an explicit Adapt or New record when a shared answer is not used, instead of
only discouraging duplication. Recommended: confirm.

Auto-merge is enabled; approval and required checks govern.
