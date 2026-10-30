# Standards: Core's Definitions — Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **core/F81** [core/I25]: Core's payload carries a `Standard` Definition, a Node typed by `KAAL Definition`. It says what a Standard is:
  - a rule a Capability holds itself, or what it builds, to;
  - owned by the Capability in whose tree it lives;
  - naming by title the Test Cases that verify conformance to it;
  - never shown as met without that evidence, so that what no test decides is validated by recorded judgment or stays unresolved;
  - binding no consumer repository by its applicability alone.
- **core/F82** [core/I25]: Core's payload carries an `Applies to` Definition, a Node typed by `KAAL Definition`. It defines the relationship from a Standard to what the Standard applies to, as an Edge type in Graph's sense.
  - **Its target** is a Capability, a Definition (which covers every Node typed by it), or a scope Definition (`core/F83`).
  - **What it declares** is applicability only: neither authorization, nor evidence that anything ran or conformed. A missing Test Case or missing evidence leaves conformance unresolved.
  - **What it does not do:** it gives the target's owner no say over the Standard, and gives the Standard's owner no ownership of the target.
- **core/F83** [core/I25]: Core's payload carries three scope Definitions, each a Node typed by `KAAL Definition`:
  - `Repository-native`: what a repository holds in its own conventions, outside its `.kaal/` Engine.
  - `KAAL Integration`: what a repository holds in its `.kaal/` Engine, and how KAAL's content is installed and kept there.
  - `KAAL Package`: a package KAAL delivers, as its consumers receive it.

  The Capability scope is the existing `KAAL Capability`. The scopes are independent: none contains another, and none relates to another.
- **core/F84** [core/I25]: A Node typed by `Standard`, with an `Applies to` Edge group, is admitted by Core like any other typed Node. Core reads no meaning into the Edge.

## Nonfunctional

- **core/N21** [core/I25]: Core defines and does nothing more. It holds:
  - no Standard instance (Core's own Standards, such as representation, come in their own Changes);
  - no list of Standards;
  - no derived view;
  - no conformance run.

  Discovery is Graph's, and the view and orchestration are Engineering's (`engineering/C5`). Under BASS, a Standard and its Edges are valid bare content without Graph or Engineering.
- **core/N22** [core/I25]: The Definitions' meaning is fixed by this PLAN. `core/C35` ships each Definition byte for byte as the Architecture states it. Changing a Definition gives it a new identity, so any change is a new Core Change.
