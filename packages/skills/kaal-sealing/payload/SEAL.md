---
name: SEAL
type:
  name: KAAL Definition
  id: a07df32ba1ed40c7c25d60b00fb4ef868b816f65c8c65c4b9e5b6030cc41abb2
---

# SEAL

Secure Each Adaption Leaving.

An adaption is secured as it leaves by a seal over its exact bytes, so that it can later be shown to be exactly what was sealed. A different version is a different artifact with its own seal: a seal never stretches to cover a later adaption. Sealing realizes SEAL in KAAL through the deterministic identity of an artifact, a Seal that binds that identity, and verification against the intended Seal.

SEAL secures integrity, not finality. A seal does not stop its author from adapting again, and neither SEAL nor Sealing decides when, by whom, or under what lifecycle condition content becomes final.

SEAL is Owner-coined and comes from KAAL.v3, whose PROTOCOL.md defined it with SHA-256 seals over messages, defects and successive gate messages. One v3 text reads "Secure Every Adaption Leaving". The name is "Each".
