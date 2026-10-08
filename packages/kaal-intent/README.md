# kaal-intent

The capability for stating what is wanted and why, and for establishing that statement as a target, as an npm package. One capability, delivered in two parts:

- `kaal/`: its KAAL contribution, the sealed Node `Intent` (typed by `Skill`) and its seal. It is registered with an installed KAAL through `kaal-core`'s `registerSkill()`, which places it under `skills/kaal-intent/` of the KAAL directory.
- `skills/kaal-intent/`: its Agent Skills realization (`SKILL.md`, `scripts/`), installed under the host's `skills/`.

Intent primarily serves the Owner. It states outcomes, reasons and boundaries and stays out of Requirements, Architecture and implementation; it prescribes no template. An Intent is a plain text file that begins with the line `# Intent`; `scripts/intent.mjs` checks that mechanical minimum and prints the Intent's identity, the SHA-256 of its exact bytes. An established Intent never changes: another want is another Intent. Intent does not decide where Intents are kept, when one is owed, who reviews it or how an outcome is judged against it, and it cannot show that an Intent is what the Owner wants.

The package is optional and is not part of `kaal-core`: Core provides the `Skill` type and the registration, and this capability joins through them, selected by the exact ID of its Node. Other capabilities consume it where it is installed; none needs it to work.

The public API is `payload()`, returning `{ kaal, skills }` as files keyed by path. The script needs Node.js 20 or later and no other package. Registering needs `kaal-core`.

Build and test from this directory alone: `npm ci && npm test`. Engineering and acceptance live outside the package, in `engineering/kaal-intent`.
