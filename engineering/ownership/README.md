# Engineering's root ownership claim

> C16 DO implements the Node, root claim and callable governance checks below,
> following the Owner's decisions on #750: Engineering is a Capability; option A
> governs root `package.json`. This does not activate C11 or change workflows.

> PLAN engineering/C16. The Owner ruled in the foundation/C11 approval (#743, review of 2026-10-31): "Engineering should own governance of root `package.json` and `package-lock.json` via a narrowly scoped root ownership claim, planned and implemented in a separate Engineering Change. This does not transfer responsibility for initiating capability dependency changes to Engineering." This is that Change's PLAN. It authorizes no synchronization, promotion or publication.

## Why a claim is needed

Every file in the repository is attributed through the ownership claims that capabilities declare in their own trees (`ownership.kaal.json`, read by Testing's `kaal-testing/attribution`; the JSON format #609 retained). A claim may list only paths inside the directory that holds it. So the two shared root files, `package.json` and `package-lock.json`, can be claimed only by a claim file at the repository root. Today no claim covers them: Testing reports them unassigned, and engineering/C11 (#739) reports any Change touching them as an unattributed path.

Who owns them was left open by engineering/C11's P3. #743 settles it: Engineering.

## What the DO delivers

1. **Engineering's Capability Node**, `engineering/capability/Engineering.md`, typed by KAAL Capability (`56fe97bf…f02e`) like `packages/kaal-core/capability/Core.md`. A claim names its owner by the exact `{ kind, name, id }` of an admitted Node, so Engineering needs one. It describes Engineering's responsibility in one paragraph: the repository's lanes, its isolation and its release engine, and the root workspace files.
2. **The root claim**, `ownership.kaal.json` at the repository root, with exactly:
   ```json
   { "owner": { "kind": "capability", "name": "Engineering", "id": "<Engineering's Node id>" }, "paths": ["package.json", "package-lock.json"] }
   ```
   Two files and nothing else. Not the root directory, which would cover every file. Not `engineering/`, whose claim belongs to engineering/C11's P3 and can come in its own Change. Not `.github/`, which travels alone.
3. **The governance rule**, in `engineering/change-isolation/check.mjs`, described below.
4. **Tests** engineering/T77–T81, each observed RED first.

## Requirements

- **engineering/F37. A narrow root claim.** The root claim names Engineering's Capability Node and lists exactly `package.json` and `package-lock.json`. No other claim covers either file, and the root claim covers no other file.
- **engineering/F38. Capabilities still start their own dependency changes.** A capability's Change that adds, removes or upgrades its own dependencies changes its own manifest. The lockfile change that npm derives from it travels in that same Change. It is admitted beside that capability without selecting Engineering, when **`package-lock.json` is exactly what npm derives from the candidate's manifests** (`npm install --package-lock-only --ignore-scripts` on the candidate leaves it byte-for-byte unchanged). Engineering governs through that check. It does not author the change.
- **engineering/F39. Root manifest changes are Engineering's.** Any change to root `package.json` (workspaces, scripts, devDependencies, engines, overrides) needs Engineering in the Change's selected scope. Until engineering/C11's DO is on the target, "Core travels alone" keeps admitting both root files beside Core, as `CORE_SUPPORT` does today.
- **engineering/F40. A lockfile npm would not derive fails.** A `package-lock.json` that differs from what npm derives from the candidate's manifests fails, named, whichever capability carries it. A hand-edited or stale lock is never admitted.

## Test Cases

| Case | What it shows | Guards against | RED first against |
| --- | --- | --- | --- |
| engineering/T77 | The root claim reads under Testing's `readClaim`, names Engineering's Node by `{ kind, name, id }`, and lists exactly the two files | false GREEN | A claim of the root directory, or a third path |
| engineering/T78 | Attribution assigns both root files to Engineering, with no conflicting claim and no other file attributed to the root claim | false GREEN | A second claim covering `package-lock.json` |
| engineering/T79 | A capability's dependency Change, with its own manifest and a derived `package-lock.json`, is admitted without selecting Engineering | false RED | One that requires Engineering for every lock change |
| engineering/T80 | A root `package.json` change without Engineering selected fails, named | false GREEN | One that admits root files beside any capability |
| engineering/T81 | A `package-lock.json` that npm would not derive from the candidate's manifests fails, named | false GREEN | One that trusts the lock's presence |

## Decisions for the Owner

1. **Engineering as a Capability Node.** A claim needs an admitted Node, so the DO creates `engineering/capability/Engineering.md`. Recommended. The alternative is to name the root claim's owner by another kind, but Engineering isn't an agent, skill or extension.
2. **Root `package.json` changes made by a capability's own Change**, such as hosting/C11's `-w kaal-hosting` selectors in root scripts:
   - **A (recommended).** They select Engineering, as F39 says. Under engineering/C11 that means an impact trace from the Change's altered elements to Engineering.
   - **B.** A root script that names only one capability's workspace counts as that capability's, and is admitted beside it. This is more convenient for renames, but it splits governance of one file by line, which the claim model doesn't express.

## Scope of the DO

The DO touches `engineering/capability/Engineering.md`, the root `ownership.kaal.json`, `engineering/change-isolation/check.mjs`, `check.test.mjs`, and this README. It touches no capability's own files, and none of `.github/`.

## Implemented boundary

`checkRootOwnership({ inventory, claimFiles, owners })` uses Testing's
`readClaim`/`attribute`. `owners` must be independently admitted by Core from the
trusted target, and the inventories must be complete. It verifies the exact
Engineering identity, the two paths and unique attribution. Invalid, stale or
competing claims cannot be resolved by precedence.

`checkRootChange({ paths, scope, targetRootManifest, targetLockfile, manifests,
lockfile }, { scratch })` accepts byte snapshots, not a `derived: true` assertion.
`manifests` maps candidate repository-relative package.json paths to bytes and
must include the root, every literal workspace and every local directory
dependency. Target root/lock bytes and selected scope must come independently
from the immutable target and its approved Change; this module does not discover
P1–P3 evidence or establish Git provenance on its own.

The caller supplies an absolute missing/empty scratch directory outside its
checkout and removes it afterwards. Hosting writes two separate reconstructions,
each containing only candidate manifests and the **trusted base lock**. Neither
receives the proposed lock, candidate code, .npmrc, node_modules or hooks. npm is
run through Hosting with `--package-lock-only --ignore-scripts --offline`, audit
and funding disabled, lockfile version 3 and empty explicit user/global configs.
Inherited npm configuration and Node loader options are not forwarded.

Both reconstructions must yield identical bytes, and those bytes must equal the
proposed lock exactly. Foundation's SHA-256 records base, every manifest,
candidate and derived lock digests alongside the observed Node/npm versions.
Snapshots are copied before asynchronous work. A root manifest edit requires
`engineering` in scope even if the path list omits it.

**Why the stronger derivation matters.** Checking only that npm leaves the
candidate lock unchanged is insufficient: npm preserved a forged `integrity`
value in an existing registry dependency in the T81 experiment. Starting from
the admitted base lock detects that change. This establishes reproducibility
from the trusted base, not fresh verification of registry artifact integrity.

Unsupported workspace patterns, absent local manifests, non-registry specs other
than known local directory dependencies, overrides, bundled dependencies,
unsupported lock versions, unavailable offline metadata or failed npm runs are
`unresolved`, never permission to skip the rule. Derivation differences are
`failed`, including when Engineering is selected. Conservative rejection can
require a separately governed extension; no online fallback is performed.

The existing path-only `check(paths)` and stdin CLI retain Core/.github defaults
exactly as F39 requires until authoritative C11 is available. The new exports are
unwired: a trusted C11 caller must compose ownership, scope and derivation checks.
This DO does not claim that current CI already enforces these new root rules.

## Verification evidence

On Node 24.22.1/npm 11.9.0:

| Case | Behavioural RED against | GREEN evidence |
| --- | --- | --- |
| T77 | Permissive ownership result accepting a third/broad path | Core admits Engineering; narrow claim passes and broad/extra/stale claims fail |
| T78 | Permissive ownership result ignoring competing claims | Both files attributed, README unassigned; an out-of-scope competing claim is refused |
| T79 | Blanket requirement for Engineering on every lock change | Actual npm-derived capability lock passes without Engineering |
| T80 | Permissive root result | Root manifest changes fail without Engineering, including an omitted path claim; pass with Engineering and a derived lock |
| T81 | Permissive root result trusting the proposed lock | Stale and changed-integrity locks fail against independent base-seeded derivation |

The permissive mutation produces four assertion failures (T77, T78, T80, T81);
the blanket restriction produces one (T79). These were rerun against the final
fixtures; no missing-export or fixture failure is counted as behavioural RED.
The wrong implementations are temporary and are not shipped.

Reproduce by temporarily prepending an unconditional `passed` result to both
exports and running the four corresponding T77/T78/T80/T81 tests; then prepend
an unconditional `failed` result to `checkRootChange` and run T79. Restore the
implementation before the GREEN run:

```sh
node --test engineering/change-isolation/check.test.mjs
npm run test:engineering
```

The isolation suite includes unresolved-input/offline-failure and asynchronous
byte-mutation challenges in addition to the five named Cases. T77 also checks
the actual Node/claim files. Test evidence is publisher/repository work; no
capability package or published artifact changes.

Local GREEN: the complete isolation suite passes 22/22 and Engineering passes
300/300, with zero skips/todos. Attribution of the staged repository through
Core and Testing assigns exactly the two root files to Engineering, with no
root conflict or root-claim finding. Remote current-head checks are recorded on
the DO PR independently of these local results.
