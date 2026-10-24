# Typed Artifacts and Type States: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **core/N8** [core/I6, core/I8]: Recognition, resolution and the states are deterministic and pure: the same files, and the same supplied Types, give the same result. The Kernel and its pinned hash are unchanged, and Graph is unchanged.
- **core/N9** [core/I8]: Core never writes, rewrites or moves a typed artifact. Checking one, before or after its Type is registered, reads its bytes only.

## Functional: recognition

- **core/F23** [core/I6]: A file that begins with frontmatter whose `type` is a string matching `<Capability>/<Type>` (`core/F6`'s Type name) is a typed artifact. Every other file that begins with frontmatter claims to be a Node and must be in Form, as before. Where a file is never decides which it is: a Node may be anywhere in an Engine, including `.kaal/config/<capability>/`, and so may a typed artifact.
- **core/F24** [core/I6]: A Node that writes its type as any other string, such as `type: KAAL Skill` or `type: guard/check`, is not a typed artifact. It is rejected as not in Form, as it is today. A file whose frontmatter cannot be read is rejected, as today.
- **core/F25** [core/I6, core/I7]: The Engine reports every typed artifact with its path, its Type and its state. A typed artifact is never admitted as a Node and never reported as a rejected Node.

## Functional: Type states

- **core/F26** [core/I7]: A Type Definition is an admitted Node typed by `KAAL Definition`, named `<Capability>/<Type>`, whose `capability` key is a reference to the admitted Node, typed by `KAAL Capability`, that owns it. Its name's `<Capability>` part is that Capability Node's name.
- **core/F27** [core/I7]: A typed artifact's Type is **registered** when the Engine admits exactly one Type Definition with that name, and that Definition's owning Capability is the one the name's prefix names.
- **core/F28** [core/I7]: It is **unregistered** when the Engine admits no Node with that name. Unregistered is not invalid. The finding names the Type and the next step: register its Definition with its Capability.
- **core/F29** [core/I7]: It is **unknown** when identity or ownership cannot be established: the Engine admits more than one Node with that name, or one that is not a Type Definition (`core/F26`), or one whose owning Capability is not the one the prefix names. Unknown is never treated as valid. The finding says what could not be established and the next step.
- **core/F30** [core/I7, core/I8]: It is **invalid** when the caller supplies the owning Capability's schema for that Type (`core/F8`, in `core/C6`'s mapping) and the artifact's frontmatter fails it. The findings are `core/C6`'s, each naming its key and rule. A supplied schema is applied whatever the registration state, and invalid takes precedence over every other state. Without a supplied schema, Core does not judge an artifact's contents.
- **core/F31** [core/I8]: The state depends only on the Engine's admitted Nodes, the artifact's frontmatter and the supplied Types. Registering a Type Definition later turns an unregistered artifact registered, with the artifact's bytes unchanged.
- **core/F32** [core/I7]: `kaal verify` lists each typed artifact with its state and finding. It fails on a rejected Node, as today, and on an unknown typed artifact. Given supplied Types, `verify` also fails on an invalid one. It does not fail on an unregistered one, and it never reports an unregistered Type as verified.
