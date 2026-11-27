# Identity and numbering: Testing

The planned outer tests live in `packages/kaal-core/test/plan/identity.test.mjs`. Each title names the contracts it checks. They are immutable to DO and CHECK. The DO turns them GREEN and adds them to Core's `npm test`.

They use `assemble` and `adoptGuid` from `kaal-core/registration`, with registrations given as their frontmatter content, as `registration.test.mjs` does. The kinds, prefixes and technical identities are fixtures: Core prescribes none.

| Test | Checks | Loop |
| --- | --- | --- |
| core/T134: a kind with `numbered` and instances whose ids follow it assemble with no finding, and `nextID` proposes one more than the highest held, the prefix and 1 when none is held, never fills a gap, and gives the same proposal to two callers | core/F125, core/F128, core/A66, core/A67 | Requirements |
| core/T135: the same identifier in two namespaces is two things with no finding, `nextID` answers each namespace on its own, and `checkID` on a claim of another `guid` for a held identifier names the holder as `id-taken` | core/F126, core/F127, core/F128, core/A67 | Requirements |
| core/T136: `checkID` returns `unnumbered-id` for an identifier that is not the prefix and a positive decimal without a leading zero and `unclaimed-namespace` for a namespace nobody claims, and `nextID` returns null with a reason where the namespace holds an unnumbered identifier, is unclaimed, or the kind is undefined or not numbered | core/F127, core/F128, core/N33, core/A67 | Requirements |
| core/T137: a renumbering, the same `guid` with another identifier, is judged as a proposal and is no finding by itself, and two proposals that take one identifier with different `guid`s each fail against a union holding the other, whatever the order the claims were given in | core/F127, core/F129, core/N33, core/A67 | Requirements |
| core/T138: one `guid` stated by two instances is a `guid-claimed-twice` finding naming both | core/F126, core/A66 | Requirements |
| core/T139: a trace that states a `guid` still resolves after its target is renumbered, and a trace that states a namespace and an identifier is unresolved after it, with nothing guessed | core/F130, core/A68 | Requirements |
| core/T140: an instance with no `guid` is reported as unadopted and is no finding, and `adoptGuid` gives the same `guid` on every call, the pinned UUID version 5 values for the fixed namespace, and a different one for every other pair of namespace and identifier, and refuses an empty namespace and one that contains `/` | core/F131, core/A68 | Requirements |
| core/T141: `newGuid` gives a UUID version 4, and two calls never give the same one | core/F132, core/A68 | Requirements |

## RED evidence

Run with `npm run build -w kaal-core && node --test packages/kaal-core/test/plan/identity.test.mjs`, outside Core's `npm test` until the DO. At `core/C164` all eight are RED, blocked before behavioural assertion, because an assembly offers no `nextID` or `checkID` and `kaal-core/registration` exports no `adoptGuid` or `newGuid`.
