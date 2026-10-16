# kaal-sealing

KAAL Sealing: the capability for establishing and verifying the immutable identity of a KAAL artifact, according to the identity defined for that artifact. It computes the deterministic identity of a file or a directory from its bytes, writes a Seal that binds that identity, and verifies an artifact against the intended Seal. It is not part of Core. Core provides the `KAAL Skill` type, a Node's identity and admission, and this capability joins through them.

```
payload/Sealing.md          the Skill Node, typed by Core's KAAL Skill
skills/kaal-sealing/        the Agent Skill: SKILL.md, scripts/sealing.mjs, scripts/kaal-sealing.mjs
```

The Node carries what Sealing means to KAAL. The Agent Skill tells an agent how to do the work and points to the Node. It assumes no host: a host places `skills/kaal-sealing/` wherever it keeps skills.

## Responsibilities

Sealing decides neither what an artifact is, nor when or by whom it is sealed. The artifact's domain does. It has no Git, GitHub or storage-provider concerns. A Git commit, a Drive file ID, a revision or a URL is a storage reference, never an identity: an artifact retrieved from anywhere is identified by the bytes retrieved, and for an exported document by the bytes of that export.

## Identity

An artifact's identity takes one of four forms, {file, directory} by {unnamed, named}, and the artifact's own domain chooses which. It is computed from the artifact's bytes alone (and, when named, its own name), so a moved artifact keeps its identity. An unnamed file with no domain is the SHA-256 of its exact bytes, which is Core's identity of a Node. Every other form needs a domain, a single line naming the kind of artifact that keeps identities of different kinds apart. The exact stream is documented on `artifactId` in `scripts/sealing.mjs`, and it is byte-compatible with the earlier KAAL `artifact-id`.

Only files take part, and directories are implied by their paths. What could not be stated the same on every platform is refused rather than normalised: names that are not NFC or not valid UTF-8, names with a backslash or control character, and paths that differ only by case.

## Seals and verification

A Seal is a canonical record of what it binds:

```
KAAL Seal
kind: directory
named: true
domain: Release Bundle v1
id: <64 hex>
```

Its **ref**, the SHA-256 of these exact bytes, names the intended Seal. `verifyAgainst(artifact, ref, retrieved)` is pure: given the bytes retrieved for that ref, it reports one of four results.

- `missing`: nothing was retrieved.
- `corrupt`: the bytes don't hash to the ref, or aren't a Seal.
- `mismatch`: the artifact, in the Seal's own form, is not what the Seal binds.
- `ok`: the artifact is exactly what the Seal binds.

Because the caller names the Seal, a later version sealed separately never satisfies the original's ref. This is integrity against a trusted ref, not authenticity: nothing here proves who made a Seal, or that the ref you hold is the right one.

## The local realization

In a KAAL Engine, each Seal is retained at `seals/<ref>/seal`. `seal(engine, artifact, form)` publishes it through kaal-hosting's `update`: one writer at a time, all or nothing, never replacing what exists, and never through a link. `verifySeal(engine, artifact, ref)` and `sealed(engine)` read the Engine through kaal-hosting's `read`, which refuses a link to a directory anywhere in the Engine, `seals/` included. A link to a file reads as that file. Since the ref is the hash of the Seal's bytes, such a link verifies only if it supplies exactly the intended Seal, so it cannot redirect verification. Core does not read Seals, because they are not Nodes. Every operation first asks Core whether the Engine holds the Sealing Node.

`readArtifact(path)` reads the artifact entirely through kaal-hosting: a file with `readFile`, its exact bytes, and what Hosting says is not a file (`NOT_FILE`) as a directory with `read`. Hosting decides what is a file, how links are treated and what is refused; a missing path is refused with `MISSING`. Sealing itself does no host filesystem access.

## Use

```sh
npm install kaal-core kaal-hosting kaal-sealing
npx kaal init --engine ./E
npx kaal register skill kaal-sealing node_modules/kaal-sealing/payload --engine ./E    # Core decides
npx kaal-sealing seal report.pdf --engine ./E                                           # prints the Seal ref
npx kaal-sealing verify report.pdf --seal <ref> --engine ./E                            # ok, or 1 with the reason
```

```js
import { readArtifact, seal, verifySeal, artifactId, verifyAgainst } from "kaal-sealing";

const ref = await seal("./E", await readArtifact("bundle"), { named: true, domain: "Release Bundle v1" });
await verifySeal("./E", await readArtifact("bundle"), ref);   // { status: "ok", sealed, id }
artifactId({ kind: "file", bytes: exported });                 // bytes from any storage
```

## License

MIT. See `LICENSE`. The license covers this package's contents only.
