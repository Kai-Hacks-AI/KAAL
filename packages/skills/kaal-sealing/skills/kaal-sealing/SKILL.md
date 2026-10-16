---
name: kaal-sealing
description: Seal a file or directory and verify it later against that exact Seal. Computes an artifact's deterministic identity from its bytes, retains a Seal in a KAAL Engine, and reports whether the artifact is still exactly what the Seal binds. Use when something must be sealed, a seal checked, or an artifact's identity is needed.
license: MIT
compatibility: Needs Node.js 24 or later and the kaal-sealing package's dependencies (kaal-core, kaal-hosting). The Engine must hold the Sealing Node.
---

# Sealing

Use this to seal an artifact, or to check that it is still exactly what was sealed. What Sealing means to KAAL is stated by the Node `Sealing` in a KAAL Engine: read it there, starting from the Engine's `AGENTS.md`. This file only tells you how to do the work.

## What belongs to whom

- **The artifact's domain** decides what the artifact is, which form its identity takes, and when it must be sealed. Sealing decides none of this, and neither does it decide who may seal.
- **Sealing** computes the identity in the form you name, writes a Seal that binds it, and verifies an artifact against a Seal.
- **Core** owns a Node's identity and decides whether the Engine holds Sealing.

## Steps

Every command below runs this skill's `scripts/kaal-sealing.mjs`. Resolve the script from this skill's own directory, not from the working directory, or use the `kaal-sealing` command when the package is installed. Paths you pass are relative to your working directory, as usual.

1. **Choose the form.** An artifact is a file or a directory, and it is *unnamed* (only what is inside it) or *named* (its own name as well). Parent, location and storage never take part, so a Git commit, a Drive file ID or a URL is not an identity. Every form except an unnamed file needs a domain, a single line naming the kind of artifact, such as `Release Bundle v1`. An unnamed file without a domain is the SHA-256 of its exact bytes, the same as a Node's id.
2. **Seal it** with `seal <path> [--named] [--domain <domain>] --engine <engine>`. It prints the **Seal ref**. Keep that ref: it names the Seal you will verify against.
3. **Verify it** with `verify <path> --seal <ref> --engine <engine>`. The form comes from the Seal. The result is one of these:
   - `ok`: the artifact is exactly what the Seal binds.
   - `mismatch`: the artifact has changed, or is not the sealed artifact.
   - `corrupt`: the retained Seal is not the Seal its ref names.
   - `missing`: no Seal is retained under that ref.
4. **Get an identity only** with `id <path> [--named] [--domain <domain>]`.

## Rules

- A sealed artifact never changes. Different content is another artifact, so seal it again and you get another ref. Never treat it as the old one.
- Verify against the ref you were given, never against whichever Seal happens to match.
- `ok` proves integrity against a ref you trust. It does not prove who made the Seal.
- Never write, edit or remove a Seal by hand, and never seal an identity you did not compute from the artifact as it now is.
- Do not add Git, GitHub or storage-provider concerns to Sealing. Bytes retrieved from elsewhere are sealed as those bytes.
