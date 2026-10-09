# Capability identity and delivery identity: architecture

How the sealed identity of a capability and the mutable delivery of it relate, from what KAAL already holds. Design only. Revised once, on the Owner's direction, after the composition design (Change `genesis/26/10/08/03`) showed what a future tool will ask of Core.

## What exists

1. **A capability's identity is its Skill or Extension Node.** A Node is a KAAL Skill (or Extension) exactly when its type refers, by name and ID, to Core's `Skill` (or `Extension`) Node. Core already answers what an instance holds: `installedSkills()` and `installedExtensions()` return `{name, id}` from the admitted graph, wherever the files store them. Names are presentation; IDs are identity.
2. **Those Nodes hold no delivery identity.** The Node Form is `name` and `type`, and nothing else is a Form; the body is prose.
3. **A delivery name is a placement input.** Registration takes it as a `capability` argument, checks only its grammar, and places the contribution under `skills/<name>/` or `extensions/<name>/`. Today the installer reads it from the deliverable: the name of the package's Agent Skill directory, falling back to the package directory. It is never checked against a Node, and Skills and Extensions to install are selected by exact Node ID, not by name.
4. **The Agent Skills standard names its own identity.** A skill's `name` is lowercase letters, digits and hyphens, at most 64 characters, and must equal its directory name. For the Agent Skill, the directory is the identity by the standard's rule. That is right for a realization and must not become the rule for the KAAL capability.
5. **The Form carries one machine-readable relation, `type`.** A sealed fact of the shape "capability X has delivery stem S" has no home in it without widening the Form, and the existing capabilities could not take part without new Nodes.

## What a future tool asks of Core

The composition design describes three seams over a source: discovery, acquisition, installation. Of Core it needs only this:

```
ask Core what is held            installedSkills / installedExtensions   {name, id}
ask a source what it offers      offers()                                {name, id}
ask the source for the bytes     fetch(id)                               proved by hashing against id
register the bytes               registerSkill / registerExtension       a placement the deliverable carries
```

Identity runs from the Node to the bytes by ID, and the source answers which package carries them. A Node never names a package and never names a directory. The delivery name arrives with the deliverable, as the layout of the bytes, and is a placement input to registration.

## Reassessment: is a sealed delivery stem, or a Form extension, needed?

No. Neither is needed, and the earlier second level of this design is withdrawn, not deferred.

- A sealed stem was only needed if something had to *compute* the expected delivery directory from sealed authority. Under composition nothing does. What must be known by identity is known by Core's typed discovery. What must be placed is placed from the deliverable. Whether the placement is acceptable to the instance is the prefix check.
- The stem would have to be carried by widening the Form, or by a companion Node that needs the same missing relation, and could not reach the capabilities that already exist. The cost is high and the benefit is nil.
- Neither a package name nor a directory is proved by hashing; only Node bytes are. That is the honest limit: the sealed proof covers capability identity and exact Node bytes, and the delivery layout is unsealed placement that the instance may choose and, with an explicit act, change.

So the relationship the intent asked for is stated by what is sealed and what is checked, not by a derivation:

```
sealed capability authority    Skill or Extension Node  {name, id}       found by type, wherever stored
instance configuration         capability-prefix                         mutable, unsealed
deliverable                    bytes proved by Node ID, with a layout   placement, not identity
checked                        the placement conforms to the prefix, holds a typed Node, and no Node is placed twice
```

## The rule

- Identity flows from the Node to the directory. A directory name is never read to learn which capability a delivery is: discovery is by Node type, selection is by exact ID.
- `capability-prefix` configures one thing: the namespace leading every capability delivery name of this instance. It does not name capabilities.
- Registration stays an observer of configuration. It accepts the delivery name it is given, enforces the grammar it already enforces, and neither reads the prefix nor derives a name. It does not verify the name against sealed authority, because none exists to verify against.
- The configuration checker may add rules that need no new authority, all functions of the admitted graph and the files: a delivery directory holds a typed Node; a Node ID is delivered in exactly one directory; relocating a directory changes only the verdict. Prefix conformance stays structural, as in Change `05/02`.
- The expected directory cannot be derived from sealed authority, only validated against the prefix and the binding. That is a settled property of the design, not a missing feature.

## Names kept distinct

| name | what it is | where it lives | governed by the instance prefix |
|---|---|---|---|
| capability identity | the Skill or Extension Node, `{name, id}` | sealed | no |
| package identity | what carries a capability's bytes at a source: a package name or an offer | the source and its adapter, never a Node | no |
| delivery name | where the instance places the contribution | `skills/<name>/`, `extensions/<name>/` in the KAAL directory | yes, for `skills/` today |
| Agent Skill naming | the standard's `name`, equal to its directory | the delivered `SKILL.md` and host `skills/<name>/` | open, see below |

Source-side names exist before and apart from any instance; a published package name is not something an instance's configuration can rename. They keep whatever convention their source follows.

Two open points remain. The prefix check covers `skills/` only; whether it applies to `extensions/` is not decided here and does not change the rule. And the Agent Skill: the standard ties its `name` to its directory, so if the instance prefix governed it the delivered `SKILL.md` would differ by instance. Governing only the KAAL delivery directory keeps the Agent Skill identical to its source, at the price that the two agree only under the default prefix. Either is coherent; the choice follows from which namespace the prefix is meant to protect, a shared agent-skills namespace or KAAL's own.

## Migration

An instance changes its prefix by editing its configuration. The checker reports each delivery it no longer finds conformant. Relocation is an explicit act: a delivery directory is renamed, and nothing is renamed by a check or by registration. Because Node identity is the bytes and a seal is `seals/<ID>`, outside every delivery directory, the installed Skills and Extensions Core reports are identical before and after.

## What stays unchanged

Node identity and sealing; the Node Form; Core's `Skill` and `Extension` Nodes and the held-capability answers; registration's behaviour; Change `05/02` and its checker. Instance configuration stays plain, unsealed and human-editable. Core learns nothing about any particular capability, and gains no concept.

## Wording

"Capability" is the Skill or Extension Node's subject, and "delivery name" is where it is placed. The `capability` argument of registration means "delivery name". Correcting that wording is left to whichever Change touches that sealed boundary.
