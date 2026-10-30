# Standards: Core's Definitions — Architecture

Each element names, in brackets, the Requirements it answers.

- **core/A40** [core/F81, core/F82, core/F83, core/N22]: The five Definitions join Core's payload under `payload/core/`, beside `KAAL Definition` and `KAAL Capability`.
  - Each is typed by `KAAL Definition` by name and id, and declares no Edges.
  - `core/C35` ships the exact bytes below. Each file is the fenced text plus one final line feed.
  - Their ids follow from those bytes. Engineering references them by name and id once they are on `main` and synchronized into `kaal/engineering`.
- **core/A41** [core/F81, core/F82, core/F83]: Core's Installation Contract (`installation.kaal.json`) lists each file as an asset, with its catalogue entry, so it deploys to `.kaal/core/` like the other foundational Definitions.
- **core/A42** [core/F84, core/N21]: No source file in Core changes its behaviour for these Definitions.
  - `evaluate` admits a Node typed by `Standard` as it admits any typed Node.
  - Edges stay Graph's to read.
  - Core adds no export, CLI command or check for Standards.

## The Definitions

`payload/core/Standard.md`:

```markdown
---
name: Standard
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# Standard

A Standard is a rule that a KAAL Capability holds itself, or what it builds, to. It is a Node typed by `Standard`, and its text states the rule. Its owner is the Capability in whose tree it lives, and only that owner changes it.

A Standard names, by title, the Test Cases that verify conformance to it. Its owner writes them. What no test can decide is validated by recorded human and agent judgment, or stays unresolved. A Standard is never shown as met without that evidence.

A Standard says where it applies through `Applies to` Edges. Its applicability alone binds no consumer repository. A package states for itself what it guarantees its consumers.
```

`payload/core/Applies-to.md`:

```markdown
---
name: Applies to
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# Applies to

`Applies to` is the relationship from a Standard to what it applies to. Its target is a Capability, a Definition, which covers every Node typed by it, or a scope Definition: `Repository-native`, `KAAL Integration` or `KAAL Package`.

It declares applicability, and only that. It is not authorization, and not evidence that anything ran or conformed. A missing Test Case or missing evidence leaves conformance unresolved.

It gives the target's owner no say over the Standard, and gives the Standard's owner no ownership of the target.
```

`payload/core/Repository-native.md`:

```markdown
---
name: Repository-native
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# Repository-native

Repository-native is the scope of what a repository holds in its own conventions, outside its `.kaal/` Engine: its source, tests, documentation and configuration. It contains neither `KAAL Integration` nor `KAAL Package`.
```

`payload/core/KAAL-Integration.md`:

```markdown
---
name: KAAL Integration
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# KAAL Integration

KAAL Integration is the scope of what a repository holds in its `.kaal/` Engine, and how KAAL's content is installed and kept there. It contains neither `Repository-native` nor `KAAL Package`.
```

`payload/core/KAAL-Package.md`:

```markdown
---
name: KAAL Package
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# KAAL Package

KAAL Package is the scope of a package KAAL delivers through a package manager, as its consumers receive it: its shipped files, its declared dependencies and its installed tests. It contains neither `Repository-native` nor `KAAL Integration`.
```

## Ownership

| Concern | Owner |
| --- | --- |
| `Standard`, `Applies to`, `Repository-native`, `KAAL Integration`, `KAAL Package` | Core (this Change) |
| `KAAL Capability`, the Capability scope | Core (existing) |
| Each Standard instance, its text and its Test Cases | the Capability in whose tree it lives |
| Discovering Standards and deriving incoming views | Graph |
| The cross-Capability view, and orchestrating owners' conformance cases | Engineering (`engineering/C5`) |
| Verified, validated and unresolved | Testing (semantic reference) |

## Change graph

| Order | Change | Owner | Depends on |
| --- | --- | --- | --- |
| 1 | `core/C34` PLAN, this Change | Core | `engineering/C5` PLAN (#610), Option A |
| 2 | `core/C35` DO: the five Definitions and their assets; core/T87–T90 GREEN | Core | 1 |
| 3 | Promotion of `kaal/core`, and synchronization into `kaal/engineering` | the Owner | 2 |
| 4 | `engineering/C5` DO | Engineering | 3 |
| later | Core's own Standards, such as representation | Core | 2 |
