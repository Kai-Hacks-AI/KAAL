# Capability identity and delivery identity: architecture

How the sealed identity of a capability and the mutable delivery of it relate, from what KAAL already holds. Design only.

## What exists today

1. **A capability's identity is its Skill Node.** A Node is a KAAL Skill exactly when its type refers, by name and ID, to Core's `Skill` Node, and Core reports the installed Skills as `{name, id}` from the admitted graph, wherever the files store them. `Changing KAAL`, `Engineering Skill` and `Sealing` are such Nodes. Their names are presentation; their IDs are identity. This answers questions 1 and 12 for the sealed side: the capability is the Skill Node, nothing else.
2. **That Node holds no delivery identity.** The Node Form is `name` and `type`, and nothing else is a Form. The body is prose. So nothing in a Skill Node states a machine name for delivery (question 2: no).
3. **The one string that does name a delivery is caller-supplied.** Registration takes a `capability` argument, checks only its grammar, and places the contribution at `skills/<capability>/`. It is not checked against any Node. That one string is today also the name of the package, of the Agent Skill directory, of the Agent Skill's own `name`, and of the engineering directory. Skill (the sealed meaning), Agent Skill (its realization), package and delivery directory share one string and have one authority between them: none. That is the conflation in question 12, and it sits on the delivery side, not the sealed side.
4. **The Agent Skills standard already names a machine identity of its own.** A skill's `name` is lowercase letters, digits and hyphens, at most 64 characters, and must equal its parent directory name. Where KAAL conforms to the standard, the directory is by the standard's own rule the identity of the Agent Skill. That is correct for an Agent Skill, which is a realization; the design must not let the same happen to the KAAL delivery.
5. **The Node Form carries one machine-readable relation: `type`.** A Node can say what kind of thing it is, by reference. It cannot also say, by reference, which capability it belongs to, and it cannot carry a second machine-readable string. A sealed fact of the shape "capability X has delivery stem S" therefore has no home in the existing Form: a Node typed by X's Skill Node would have X as its type and nothing to say what such a Node means; a Node typed by a general definition could name S but could not reference X except in prose, which is interpretation.

Consequence: the existing Node model does not contain sufficient authority to determine a delivery stem (questions 2 and 3), and the smallest carrier that would is a widening of the Form itself. That is a Core bootstrap change with its own seals, bridge and ordering, and is not justified by this question alone.

## The rule

Two levels, so that what can be settled now is settled, and the rest is specified without being built.

### Level 1: binding by content (no new concept)

The delivery directory is bound to a capability by the Skill Node it holds, never the reverse.

```
SEALED                         INSTANCE
Skill Node (name, ID)    <--   delivery directory holds it
seals/<ID>                     delivery name = prefix + a name the instance chose
```

- Identity flows from the Node to the directory. A directory name is never read to learn which capability a delivery is.
- `capability-prefix` configures one thing: the namespace leading every capability delivery name of this instance. It does not name capabilities.
- Registration stays an observer of configuration: it accepts the delivery name it is given, enforces the grammar it already enforces, and does not read the prefix. It does not verify the name against sealed authority, because there is none to verify against (question 7).
- The configuration checker may add rules that need no new authority, all of them functions of the admitted graph and the files: a delivery directory holds a Skill; a Skill ID is delivered in exactly one directory; and relocating a directory changes only the verdict.
- Prefix conformance stays structural, as Change `05/02` has it. `kaal-whatever` conforms and is a legitimate instance choice, because at this level the instance names deliveries.

At this level the expected directory cannot be determined from sealed authority, only validated against the prefix and the binding. Question 6 is answered no, and that is a limit of the existing model, not of the checker.

### Level 2: a sealed delivery stem (the target relation, not built here)

If the instance is to be able to say what a delivery directory *should* be called, the capability portion must be sealed authority, explicit, with no derivation from a Node's name:

```
sealed capability authority   stem   changing
instance configuration        prefix kaal-
                              expected  kaal-changing   (concatenation, nothing more)
```

The relation is fixed here so a later Change can implement it without redesign:

- The stem is sealed with the capability. The prefix is not. The delivery directory is neither: it is derived, observable and replaceable.
- Expected name is exactly prefix then stem. No slugging, no case or stop-word rule.
- A checker reports each delivery directory that is not the expected one, naming the expected and the actual name. When no stem is sealed for a Skill it says so and does not guess.
- Registration may then verify the name it is given against the stem, as a check on a name, never a source of one.

Carriers considered for the stem, none chosen:

| carrier | sealed | no Form change | retrofits existing capabilities | interpretation-free | cost |
|---|---|---|---|---|---|
| a new frontmatter property on the Skill Node | yes | no | no: their Nodes are sealed and cannot change | yes | widens the Form |
| a prose line in the Skill Node | yes | yes | no | no | invents a grammar over prose |
| derived from the Node's name | yes | yes | yes | no | forbidden: a naming grammar |
| the Agent Skill's `name` | no | yes | yes | yes | authority is unsealed realization |
| a companion Node naming the stem | yes | yes | yes | no, its link to the capability is prose | needs the same relation the Form lacks |

Only a Form-level relation makes the carrier both sealed and interpretation-free, and it cannot retrofit the three existing capabilities without births (a new Node is a new Node; there is no supersession). That is why Level 2 is a decision for the owner of the Form, not for this Change.

## Migration

An instance changes its prefix by editing its configuration. The checker then reports each delivery it no longer finds conformant. Relocation is an explicit act: a delivery directory is renamed, and nothing is renamed by a check or by registration. Because Node identity is the bytes and a seal is `seals/<ID>`, outside every delivery directory, the installed Skills Core reports are identical before and after (question 10). This is the acceptance of Change `05/02` already in place, extended from "a Skill's bytes, ID and seal" to "the set of installed Skills".

## Other names

| name | what it is | governed by the instance prefix |
|---|---|---|
| Skill Node name | presentation of the capability | no |
| Skill Node ID | identity of the capability | no |
| delivery directory under the KAAL directory | instance placement | yes |
| Agent Skill directory and `name` | the standard's identity of the realization | open, see below |
| package name, engineering directory | source-side identities | no, by default |

Source-side names exist before and apart from any instance; a published package name is not something an instance's configuration can rename. They keep whatever convention their source follows.

The Agent Skill is the open point. The standard requires its `name` to equal its directory, so if the instance prefix governed the Agent Skill directory too, the delivered `SKILL.md` would differ by instance, and the delivered bytes would stop being a pure projection of the source. Governing only the KAAL delivery directory keeps the Agent Skill identical to its source, at the price that the two names agree only while the instance keeps the default prefix. Either is coherent; the choice follows from which namespace the prefix is meant to protect, a shared agent-skills namespace or KAAL's own.

## What stays unchanged

Node identity and sealing; the Node Form; Core's `Skill` Node and the installed-Skills answer; registration's behaviour; Change `05/02` and its checker. Instance configuration stays plain, unsealed and human-editable, and Core learns nothing about any particular capability.

## Naming of the concept

"Capability" is the Skill Node's subject, and "delivery name" is where it is placed. The word `capability` in registration's argument and in some docs means the second, and should be read as "delivery name". Correcting the wording is a change to a sealed-boundary API's documentation and is left to the Change that touches it.
