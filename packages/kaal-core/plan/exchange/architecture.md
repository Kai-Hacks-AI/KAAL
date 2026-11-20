# Exchange: Architecture

Each element names, in brackets, the Requirements it answers.

- **core/A45** [core/F89, core/F91]: The Definition is `payload/core/KAAL-Exchange.md`, replacing `KAAL-Extension.md`. `CASE.md` and the Kernel's Foundation name `KAAL Exchange` where they named `KAAL Extension`, and `AGENTS.md` and the Core documents follow. The Foundation still names six foundational Nodes, so its shape is unchanged. Its bytes are not: the Kernel id, the `CASE` id, the `KAAL Extension` id and every pinned id that depends on them change. `foundation()` returns `exchange` where it returned `extension`.
- **core/A46** [core/F90]: `Kind` is `capability | agent | skill | exchange`, one row each in `register.ts` (directory `exchanges`, article "an"). `catalog` returns `exchanges` where it returned `extensions`, and `registerExchange` and the CLI replace their Extension forms. There is no alias, no second spelling and no deprecation period: kaal-core 0.0.1 is unreleased, so there is no consumer to migrate.
- **core/A47** [core/N24]: The admission rule for every kind is the one rule in `register.ts`: at least one Node typed by the kind's own Node, none by the other three. An Exchange adds no rule of its own, so Core cannot read its content.

## Options considered

| Option | What changes | Cost |
| --- | --- | --- |
| **A. Replace `KAAL Extension` by `KAAL Exchange`** (recommended) | One Definition replaced, the Kernel's Foundation reworded, one kind renamed. | Every foundational id changes. Free while 0.0.1 is unpublished, and every Engine bootstrapped earlier stops verifying, which the README already says of any foundational change. |
| B. Keep `KAAL Extension` and add `KAAL Exchange` | Five kinds. | Contradicts the Owner's rename, keeps a kind nothing needs, and leaves CASE with five parallel kinds. |
| C. Keep the `KAAL Extension` id, change only the name | Name changes, bytes do not. | Impossible: the name is in the bytes, and the id is the hash of the bytes. |

## Effects outside Core

Core's DO changes Core only. Each of these is the owner's Change, and none is done here.

| Change | Owner | Why |
| --- | --- | --- |
| Retype Hosting's Node (`kaal-hosting/kaal/Hosting.md`, today typed by `KAAL Extension`), its ownership claim (`kind: extension`) and the tests that name them | Hosting | Settled by the Owner: Hosting is a Capability (it always was), so the Node becomes typed by `KAAL Capability`. Order: Core's Change first, then Hosting's own Change. Hosting's tests fail against Core's DO until Hosting's Change is done. |
| CASE kinds Testing's attribution accepts (`extension` becomes `exchange`) and the claims that use them | Testing | It reads the kinds as Core names them. |
| `engineering/03-exchanges/<exchange>/`, the defect exchange first | Engineering | Applies the kind. Needs only the word "Exchange"; it types no Node by `KAAL Exchange` before Core's DO. |
| Redelivery of `.kaal/core/` | Engineering | A delivery, placed by WIRE, not by this Change. |
