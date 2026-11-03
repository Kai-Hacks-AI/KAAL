# Core/C52 PLAN: Core is installed, then registered, like any package

Logical Change core/C52, numbering rejudged at integration. It is the separate PLAN that the C50 RED Cases
(`plan/consumer-composition/red-cases.md`, Cases core/T115 and core/T116, #970) promised for their findings. Target:
Core 0.0.1, on the CTO's view; the CPO confirms the scope on this PLAN.

## Rulings this PLAN rests on (Kai, 3 November)

- The package, by design, contains no registrations. An installed Core is an instance in a target repo, uses the Engine
  `./.kaal` by default, and has the capability to register.
- **Package installed is not package registered**, for Core as for any other package (1 + 1 > 2). Core's registration-
  dependent features, such as the Registration Type Definition, are active only once Core is registered in the instance.
- Conceptually two transactions: (1) `kaal init` installs the instance; (2) something like `kaal register core`
  registers a package, Core included. The command name is not settled.

## Today

1. `kaal init` installs the instance: it copies Core's payload into `.kaal/` and writes Core's record. It does not register
   Core.
2. `kaal register <capability|agent|skill|extension> <name> <dir>` already registers a package's contribution under
   `.kaal/capabilities/<name>` (and the other kinds). Run as `kaal register capability core <dir>` on a directory holding
   Core's `Core.md` and `Registration.md`, it makes the Registration Type active: a consumer's Registration Nodes are
   then admitted (checked against the source `capability/` in a clean consumer; the rest of T115 passes).
3. The package does not carry that directory. `capability/Core.md` and `capability/Registration.md` are not in the
   package `files`, so an installed Core has nothing to register itself with. Core's own tests pass only by using the
   source tree's copy. (T115, RED.)
4. An installed but unregistered Core reports each Registration Node as `unregistered: no Type Definition named
   Core/Registration; register one with the Core Capability`. It does not say that Core itself is not registered in this
   Engine. (T116, RED.)

## Change

1. **Transaction 1, install.** `kaal init` is unchanged: it installs the instance and does not register Core. The
   package `files` add `capability/`, so Core carries its own contribution, one source and no copy under `payload/`.
   The Installation Contract does not catalogue these two files under `.kaal/`, because delivery is registration, not
   copying.
2. **Transaction 2, register.** Core registers itself as any package does, from the installed package's own
   `capability/`. No new mechanism: the existing registration, its admission and its record apply.
3. **Unregistered state.** `verify` names the state when Core's own Capability is not registered in the Engine: that
   Core is installed but not registered, and the remedy command. The finding for a Registration Node without its
   Definition keeps its current meaning. The exact wording is proposed in T116 for the CPO to settle.
4. `test/verify.json` is regenerated with `npm run manifest`; nothing else generated changes.

## Command surface (proposal; final name an open Owner question)

Registration is already covered by the existing command, so no new command is required:

- **Option A, no new surface:** document `kaal register capability core node_modules/<core-package>/capability`.
  Smallest change; the path is long and package-name-dependent (the scoped rename is pending).
- **Option B, a convenience form:** `kaal register core`, which registers Core's own bundled `capability/` and nothing
  else. It adds one CLI form, so it is a new interface and needs the Owner. It resolves the package location itself, so it
  survives the scoped rename.

Recommendation: B for usability, kept as sugar over the existing registration so the two forms cannot differ. **Open
Owner question: A or B, and the name.**

## What changes for a consumer

- After `init` alone, the instance is installed and Core reports that it is not registered. After the second
  transaction, Registration Nodes are admitted as their Type and the `unregistered` finding disappears.
- `kaal list` shows Core's own Capability once it is registered, not before. Existing cases that assume a registered
  Core after `init` are named in the RED review before DO, not amended silently.
- No registration is shipped. `.kaal/registrations/` stays the consumer's own.

## Cases

- core/T115 (RED in #970): the packed Core carries its contribution, and registering it makes the Registration Type active.
  GREEN with Change items 1 and 2, assertion unchanged. If Option B is chosen its form is covered by a further Case.
- core/T116 (RED in #970): the unregistered state is named plainly. GREEN with Change item 3.
- To add as RED before DO, in `test/plan/`: registering twice is refused or idempotent, as the existing registration rules
  say; `remove` leaves a consumer's registrations; registered Core survives `upgrade`. No existing test is amended.

## Out of scope

Registering any other capability's contribution; Foundation's declaration delivery; Hosting's binding; Graph behavior.
Promotion and npm publication remain Owner decisions.

## Dependencies

#970 lands first or together. DO touches `package.json` and `test/verify.json`, which the pin candidate #868 also touches,
so DO is sequenced after it or rebased onto it.
