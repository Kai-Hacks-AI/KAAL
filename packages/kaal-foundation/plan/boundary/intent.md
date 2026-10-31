# Consumer boundary: Intent

foundation/C11 is this PLAN. It ships no code. foundation/C12, its DO, turns the planned cases GREEN. It authorizes no synchronization, promotion, version change or npm publication: those stay with the Owner.

On 2026-10-31 the Owner asked two things. Does Foundation ship boundary tests, and can they run against Guard? The answer was no, because every case Foundation ships tests only Foundation itself. The Owner then asked for a design: "It should be testing without knowing details of what it tests, so arguably it can only do the outer loop."

So Foundation's boundary check stays at Intent level. It checks a consumer only against Foundation's own outcomes, foundation/I1 (one SHA-256 for KAAL) and foundation/I2 (adopting it changes no digest). It sees only what any npm package exposes and what the consumer itself states. A consumer's source, layout, language and tests are inner loops. They belong to the consumer's own Requirements and Architecture tests, never to Foundation.

- **foundation/I8.** **A consumer can show it holds Foundation's outcomes, and Foundation needs no knowledge of the consumer to check that.** Any package, KAAL or not, can ask Foundation two questions:
  - Is the Foundation it resolves a verified Foundation (foundation/I1)?
  - Are the SHA-256 digests it states the digests Foundation computes for the same bytes (foundation/I2)?

  The answer is `verified`, `failed` or `cannot verify`. Foundation never judges how the consumer gets its digests.

**How a boundary case is derived (the Owner's question, 2026-10-31).** A boundary case is one of Foundation's own outer cases, Intent or Requirements, with the consumer as its subject. Architecture has no counterpart, because a consumer cannot break Foundation's placement. Its expectation is not simply the opposite of the provider's case. Each Foundation obligation takes one of three forms at the boundary:
- **mirror**: the same expectation, held by the consumer. Foundation's digest is FIPS SHA-256, so the consumer's stated digest is Foundation's digest.
- **inverted**: Foundation's guarantee becomes the consumer's precondition. Foundation refuses a value that is not a `Uint8Array`, so a consumer must never depend on that refusal. An inverted case is visible only by running the consumer. It is outside the outer loop, so Foundation reports it as not judged, and the consumer's own tests own it.
- **none**: the obligation is Foundation's alone, such as purity, layout, provisional ownership or the manifest. It has no boundary case.

`testing.md` derives every boundary case from a Foundation identifier this way.

This PLAN changes nothing a consumer computes. `lib/sha256.mjs` and `lib/sha256.d.ts` stay byte for byte the same (foundation/N5, foundation/N9).
