# An installed copy is the packed one, and an older nested copy is a pin-behind (packaging/C28, provisional)

PLAN only. It changes no runtime file, publishes nothing and authorizes no merge, SYNC, promotion or publication. It takes over from Testing's #1286, which is superseded by it (Kai, 9 Nov 2026: "must be owned by packaging. Packaging can use testing, provided both are available").

## Intent

**packaging/I8.** An installation host must hold the packed tarball of every package a run packed. A copy that differs is reported, and one narrow difference is visible without being a failure: a copy nested under some consumer, from a registry, at a strictly older version than the packed one (a consumer that stays on an older published release, as `foundation/C19` allows a consumer of Foundation to do).

**packaging/I9.** Every other difference stays a failure. A top-level copy with other bytes, a nested copy of the same version, a newer one, a copy that came from anywhere but a registry, and a copy whose versions cannot be compared are each a failure, because each can mean the run did not test what it packed.

## Placement homework (Kai, 9 Nov: for each node, ask "ours or not ours?", then "way of working or solution?", and name the target home)

| Node | Ours? | Delivery or solution? | Home |
| --- | --- | --- | --- |
| The rule: a held copy differing from the packed one is a finding, and which differences are non-failing | **Ours** | Delivery (the same for every package) | Packaging, `lib/held.mjs` (this PLAN) |
| The facts: what npm's record says each host holds (path, depth, consumer, held and packed version, integrity, origin) | Not ours | Mechanics of running and reading a run | Testing's `findings`, handed over neutrally, with no verdict and no consumer's name (its own PLAN) |
| Recording the packed `version` in the manifest | Not ours | Delivery | Engineering (`engineering/delivery/pack.mjs`, one line) |
| What may be nested and each consumer's floor (`foundation/F32`) | Not ours | The consumer's policy | Foundation and Engineering's classifier for the embed scenario |
| What a `pin-behind` gates, and whether a CI summary shows it (`foundation/F31`) | Not ours | The lane | Engineering |
| The install-and-verify Cases of Foundation (T16, T17, T47) and Testing's install and ledger code | Probably ours (Delivery, the same for all packages) | Delivery | Packaging, later and by its own PLAN. Kai: not now. Held by Engineering until Packaging lands |

Born local, live, refactored later: until Packaging is on main, Foundation 0.0.2 handles its pin-behind case by hand, and Engineering's lane keeps the classifier. This PLAN puts the rule in its correct home now, so that moving it later is a swap of one function.

## Requirements

- **packaging/F53** [I8, I9]: **One pure classifier.** `classifyHeld(fact)` takes one neutral fact and returns `{ verdict, reason }`, where `verdict` is `"match"`, `"pin-behind"` or `"verified failure"`. A fact is `{ package, at, depth, consumer, held, packed, integrity, packedIntegrity, resolved }`. `depth` is the number of `node_modules/` segments in `at`, and `consumer` is `null` at depth 1. It reads nothing else.
- **packaging/F54** [I8]: **`match` when the bytes are the packed bytes.** `integrity` equal to `packedIntegrity` is `match`, whatever the depth or version.
- **packaging/F55** [I8]: **`pin-behind` only when all of these hold.** `integrity` differs, `depth` is at least 2, `consumer` is a name, both `held` and `packed` are plain `x.y.z` versions, `held` is strictly lower than `packed`, and `resolved` is a registry tarball URL.
- **packaging/F56** [I9]: **Everything else is `verified failure`, and the reason names which of these it is.** A top-level copy (`depth` 1). A nested copy at the same version, or a higher one. A versions pair where either is missing, not plain `x.y.z`, or carries a prerelease or build suffix. A `resolved` that is missing, a local file or tarball, a link, or not a registry URL (a replaced copy). Anything not stated in F55 fails closed.
- **packaging/F57** [I8]: **A `pin-behind` is visible and decides nothing by itself.** The verdict names the package, consumer, held and packed version. A caller that gates on `pin-behind` says so itself. The classifier never reads a floor, a list of packages or a role.
- **packaging/N13** [I8, I9]: The classifier is pure and the same on every host: it reaches no file, process, network or clock, names no package, no consumer and no role, and holds no list of targets. Its inputs are the fact alone.

## Architecture

- **packaging/A28** [F53–F57, N13]: `lib/held.mjs` exports `classifyHeld`, offered as `kaal-packaging/held`. It imports nothing from the host and reuses the registry-URL pattern the installation check already holds (`REGISTRY_TARBALL`, packaging/F19's registry-origin rule), moved to one place both read, so a nested copy's origin is judged the same way as a prerequisite's.
- **The hand-over to Testing.** Testing's `findings` takes an optional `judge(fact)` that returns a verdict kind, `"verified failure"` when none is given, so Testing fails closed. Engineering's lane passes `classifyHeld` (adapted to the kind it returns). Testing never learns the rule, and Packaging never learns the host's mechanics. The fact shape above is the one agreed with Testing on 9 Nov.

## Testing (the RED Cases)

The Cases run against `lib/held.mjs`, which does not exist yet, so all of them are RED until the DO. They sit in `test/embed/held.test.mjs` and are listed in the manifest.

| Case | Checks | Role |
| --- | --- | --- |
| packaging/T137: a nested older registry copy is `pin-behind`, naming package, consumer, held and packed version | F55, F57 | RED |
| packaging/T138: a copy whose integrity equals the packed one is `match`, at any depth and any version | F54 | RED |
| packaging/T139: a top-level copy with other bytes is a verified failure | F56 | control for the rule, RED until it exists |
| packaging/T140: a nested copy of the same version, and one of a newer version, are verified failures | F56 | RED |
| packaging/T141: an older nested copy whose `resolved` is missing, a `file:` path, a link or a non-registry URL is a verified failure (a replaced copy) | F56 | RED |
| packaging/T142: a missing, non-plain or prerelease version on either side is a verified failure | F56 | RED |
| packaging/T143: the classifier is the same for any package name and any consumer name, reads nothing but the fact, and its source names no package, consumer or role | N13, F57 | RED |
| packaging/T144: `kaal-packaging/held` is exported, and importing it needs no host module | A28, N13 | RED |

T137 to T142 come from Testing's T141 to T147, ported. No Case of an earlier PLAN changes.

## What this PLAN does not do

- It does not move Testing's install, ledger or `findings` code into Packaging. That is a larger move (Testing's assessment: about 270 lines), for its own PLAN after Foundation 0.0.2, and Kai has not approved it.
- It does not set which packages may be nested or any floor. That is the consumer's policy (`foundation/F32`).
- It does not make Packaging's own result depend on Testing: Packaging uses Testing's facts only where both are available (Kai: 1+1>2), and the classifier works on a fact however it was obtained.
- It does not change the installation check's verdicts (C26).

## Order and critical path

1. This PLAN, for the CPO.
2. RED and DO together on one branch, RED commit first, so the failing Cases are on record.
3. Testing's neutral-facts DO (its own PLAN and PR) and Engineering's one-line manifest `version`, then Engineering's lane passes `classifyHeld` as `judge`.

Not on Foundation 0.0.2's critical path: Foundation handles its case by hand, with Kai's acceptance of the redo risk.

## Open

- Whether `kaal-packaging/held` becomes one of the shipped exports of Packaging 0.0.1 or stays an Engineering-only entry. It follows Packaging 0.0.1's layout move.
- Whether the `judge` hook returns `"pin-behind"` as the verdict kind itself or Packaging maps it. Agreed in principle with Testing: Packaging passes its classifier in.
