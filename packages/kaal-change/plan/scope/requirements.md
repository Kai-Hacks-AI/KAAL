# What a Change Changes, and Its Selected Scope: Requirements

Each Requirement names, in brackets, the Intents it serves. They extend `change/C1`'s `assess` and `exchange()` (plan/delivery/), and change none of its other members.

## Functional

- **change/F33** [change/I16, change/I18]: **What a Change changes.** A Change Node states the elements it changes in its frontmatter as `alters`: a nonempty list of element identities as their owners assign them, `<namespace>/<letters><n>`, such as `hosting/F31`, `core/A36` or `testing/N7`.
  - **Only identities.** An entry is the owner's identity and nothing else. A path, a file name, a URL or a pull request is never an element.
  - **Not judged by Change.** Whether the element exists, what kind it is, and what it is traced to, are its owner's and the tracer's. Change never resolves an entry, and a well-formed entry that no Node defines is no finding of Change's.
  - **Malformed.** A list that is empty or not a list, or an entry that is not a well-formed identity or that repeats, is a `malformed-alters` finding naming the Change and the entry.
- **change/F34** [change/I17, change/I18]: **The selected scope.** A Change Node states the capabilities it will change in its frontmatter as `scope`: a nonempty list of capability names, each the namespace of the capability's identities, such as `hosting` in `hosting/C11`.
  - **Never a path or a pull request.** An entry with a `/`, a `.`, a `#`, a digit-only name or anything else outside the namespace form is malformed. So is a Change identity.
  - **Not judged by Change.** Who owns a namespace is Capability registration's (`core/C24`). Whether a capability is within the computed impact, and which paths its ownership claim attributes, are Engineering's (`engineering/F25`–`engineering/F27`).
  - **Malformed.** A list that is empty or not a list, or an entry that is not a well-formed name or that repeats, is a `malformed-scope` finding naming the Change and the entry.
- **change/F35** [change/I16, change/I17]: **All or nothing.** A statement with any malformed entry is withheld whole: the view gives nothing for it, and the exchange omits it. A partial selection is never given as if it were the Change's, so a consumer that judges against it falls back to its own default (`engineering/N13`), never to a narrower scope than the one stated.
- **change/F36** [change/I16, change/I17, change/I18]: **Views and exchange.**
  - **Views.** `alters(identity)` and `scope(identity)` list a walked Change's statements, sorted. A Change that states none, or whose statement is withheld (change/F35), gives `undefined`. That means "not stated", which is never an empty list.
  - **Exchange.** Each `exchange()` entry carries `alters` and `scope`, sorted, only when its Change states them well-formed. Every other member of change/F13 is unchanged.
  - **New finding kinds.** change/F13's kinds are extended with `malformed-alters` and `malformed-scope`, in the same order of kind, then change, then their JSON.
  - **Determinism.** The same Nodes, in any order, give byte-identical JSON.
- **change/F37** [change/I18]: **Delivery is unchanged.** `alters` and `scope` take no part in satisfaction or delivery (change/F15–change/F17, change/F27, change/F28). A malformed statement is a finding, and never holds a Change from delivery.

## Nonfunctional

- **change/N8** [change/I17]: **Change states, Engineering judges.** `assess` reads no path, no ownership claim, no repository and no pull request, and computes no impact. Its result never says that a Change is isolated, in scope, or admitted.
