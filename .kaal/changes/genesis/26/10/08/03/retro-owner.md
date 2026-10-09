# Retro

## Learned

Separating KAAL's engine from the Work it governs requires distinguishing three things: Engine, Record and Subject. Their locations are independent, and none should determine the location of another.

The original proposal to relocate Changes exposed the underlying requirement, but relocation itself was not necessary to establish the architecture.

The independent review also demonstrated that identity preservation alone is insufficient when a control can accidentally read an empty baseline. Preservation requires independent and trustworthy resolution of baseline and candidate Records.

## Liked

That the investigation challenged its original solution rather than defending a directory move.

That Engineer, Embed and External KAAL were considered explicitly, especially the ability of External KAAL to work on a repository without installing KAAL artifacts.

That the Reviewer identified a genuine preservation weakness before implementation, and the Worker demonstrated both successful relocation and refusal of missing history using existing Changes and seals.

That the architecture now identifies a smaller first implementation without moving admitted history.

## Lacked

An implemented Record locator and production admission controls capable of resolving baseline and candidate Records independently.

A complete lifecycle demonstration using a Record stored outside `.kaal/`.

An established convention for where repository-owned operational records belong. That decision should follow actual host needs rather than become a universal layout requirement.

## Longed

For KAAL to operate consistently across Engineer, Embed and External modes, with the same capabilities and lifecycle semantics regardless of where Engine, Record and Subject reside.

For the first implementation to prove this separation without relocating sealed history.

For later migration decisions to be ordinary, identity-preserving Changes rather than special exceptions to KAAL's preservation guarantees.
