# kaal-request (engineering)

The machinery that proves the delivery of `packages/kaal-request`, the capability by which a KAAL client deliberately addresses a request to KAAL. It is not shipped, and it is not part of `kaal-core`.

`npm test` here is acceptance, run on what the package actually ships:

- **Delivery.** Deploy `kaal-core`'s payload, register the capability's Node through Core's `registerSkill()`, and show that Core carried no such Skill before, that exactly one Node and its seal are added, that the Skill is found by its type alone, that its bytes and identity are the ones sealed, and that its Node says what a carrier is, that the capability is optional, and that transport, submission and collection are not its concern, without naming any mechanism, process or client.
- **Realization.** The Agent Skill is one skill, named as its directory, points to the Nodes rather than defining the capability again, and ships exactly one script, which knows nothing of Git, GitHub, networks or any client.
- **The form.** `request.mjs` is challenged through the command an agent runs: the canonical bytes are written out here as literal text; the carrier lands at `requests/YY/MM/DD/CC.md` inside the KAAL directory, numbered one after the highest of its day with no gap reused; what it refuses it refuses without writing anything; and `check` accepts exactly the canonical form.
- **On a host.** On a repository that holds no KAAL, nothing installs the capability unless it is selected by the exact ID of its Node; once selected it is a valid installed KAAL; a carrier made there stays in the KAAL directory, is found and accepted by a reader that knows only the form, and is neither disturbed by installing again nor reported by `check-kaal-install`; and selecting this capability does not install `kaal-incident`.
- **Conventions.** The capability passes the checks Engineering KAAL Skill carries, and its contribution passes `register-skill --check`.

Admission is judged by the one implementation `kaal-core`'s registration uses, reached in the built package and not through its public API. The shipped Node was sealed with the Sealing capability's own scripts; the acceptance only shows it is sealed by its own bytes.
