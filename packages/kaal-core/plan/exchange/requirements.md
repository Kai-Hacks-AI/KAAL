# Exchange: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Nonfunctional

- **core/N24** [core/I26]: Core reads no Exchange's content. An Exchange contribution is accepted or refused by the types of its Nodes alone, as for the other kinds. A Node typed by `KAAL Exchange` registers whatever its body says.

## Functional

- **core/F89** [core/I25]: Core's payload carries a `KAAL Exchange` Definition Node, typed by `KAAL Definition`, in the place of `KAAL Extension`. It states what an Exchange is (the handovers between Capabilities, who hands what to whom), and that an Exchange states what verifies it is done. No Node named `KAAL Extension` is carried, and no Definition Core carries refers to one.
- **core/F90** [core/I25]: `exchange` is a registrable kind and `extension` is not. A contribution of the kind registers all or nothing like the others, is published under `exchanges/<name>/`, and is listed by `catalog` and `kaal list` as exchanges. `registerExchange` replaces `registerExtension`, and `kaal register exchange <name> <dir>` replaces `kaal register extension`.
- **core/F91** [core/I25]: The four CASE kinds are exactly the four Definitions Core registers a kind for: `KAAL Capability`, `KAAL Agent`, `KAAL Skill` and `KAAL Exchange`, each typed by `KAAL Definition`. The Kernel's Foundation names them, so an Engine that lacks one does not verify.
