# engineering/D1: the Release selector builds the first of two Hosting workspaces

Owner: Engineering (the Release workflow and engine). Instance owned by the context that raised it, as the Owner decided for Defects. Raised by the CPO on #985 (formal comment) after the Owner asked that the Hosting compatibility problem be recorded as a Defect with its precise location, 3 November 2026.

## Record

Plain data, in the shape of the Defect record definition under review in #991 (`id`, `context`, `expected`, `observed`, `where`, `status`, `tests`; the definition is not yet on `main`, so this record is checked by eye, not by `check`).

```json
{
  "id": "engineering/D1",
  "context": "engineering (the Release workflow)",
  "expected": "An ambiguous Hosting workspace selection fails the step and builds neither workspace.",
  "observed": "With two matching workspaces the selector builds the first and the step succeeds.",
  "where": ".github/workflows/release.yml@f6a9f12dbbef (Pack, Publish and Accept build steps), introduced by #949, synchronized by #985",
  "status": "confirmed",
  "tests": ["engineering/T82"]
}
```

`tests` names only the RED Case. The preconditions and controls have identities of their own (engineering/T84, T85, T86) and are not Cases that expose the Defect.

## Location

`.github/workflows/release.yml`, the three `npm run build` steps (Pack, Publish and Accept). They arrived on `main` through #949 (the `.github`-only promotion) and reached `kaal/hosting` through #985 (the SYNC). The selector, exactly:

```
npm run build --workspace="$(npm query '[name=kaal-hosting],[name="@kaihacksai/kaal-hosting"]' | node -p 'JSON.parse(require("fs").readFileSync(0,"utf8"))[0].location')"
```

## Observed

The selector accepts both Hosting names so that one workflow builds Hosting before and after the scoped rename, and it takes the first `npm query` result.

| Matches | Result | Status |
| --- | --- | --- |
| 0 | `[0].location` throws, npm refuses the empty `--workspace=` ("No workspaces found"), exit 1 | fails closed |
| 1 | that workspace is built | correct |
| 2 | the first is built and the step succeeds | **defect** |

## Expected

An ambiguous selection fails the step and builds neither workspace.

## Cases, version and confirming Run

| Identity | Role | File |
| --- | --- | --- |
| engineering/T82 | the RED Case: a tree with more than one workspace the selector could take is refused, and nothing is built | [selector-ambiguity.red.mjs](selector-ambiguity.red.mjs) |
| engineering/T84 | precondition: the workflow has three Hosting build steps to judge | same file |
| engineering/T85 | control: a workspace the selector accepts is built, and only that one | same file |
| engineering/T86 | control: no matching workspace stops the build | same file |

**Case version:** the Git blob id of `selector-ambiguity.red.mjs`, `4d488412a07ce496c90310bf5357945b32144d63`.

**Confirming Run** (one Run observed all four Cases; Node v22.23.4, Linux; subject `.github/workflows/release.yml` blob `f6a9f12dbbef`, collector head 5557578 plus this change):

```
ok 1 - engineering/T84 the workflow has three Hosting build steps to judge
ok 2 - engineering/T85 control: a workspace the selector accepts is built, and only that one
ok 3 - engineering/T86 control: no matching workspace stops the build
not ok 4 - engineering/T82 RED (engineering/D1): a tree with more than one workspace the selector could take is refused, and nothing is built
  error: '["kaal-hosting","@kaihacksai/kaal-hosting"]: the step succeeded and built ["kaal-hosting"] instead of refusing the ambiguity'
```

T82 is `failed` on an assertion, after its three preconditions and controls passed, so the failure is the ambiguity and not a broken fixture. The Case reads the real workflow and runs the build lines it contains against a scratch repo.

**Answered** only by a later Run in which engineering/T82 passes at this same Case version (blob `4d488412...`), as its latest observation. If the correction needs a different Case version, that version needs its own confirming RED against the old `release.yml` before it can answer D1; an edited Case alone answers nothing.

**Why the Case should not need editing, and why it cannot pass vacuously:** it finds the Hosting build steps by what they do (a `run:` step that runs `npm`, builds, selects a workspace with `--workspace` or `-w`, and names kaal-hosting) and reads the package names each line accepts from the line itself. Its ambiguity case builds every tree in which the selector has two candidates: one workspace of each accepted name, when it accepts more than one, and two workspaces of the same accepted name, which npm itself refuses (`EDUPLICATEWORKSPACE`). A selector that accepts a single name is therefore still tested for rejection of an actual two-workspace tree, and does not pass because its list of names shrank. The separate controls guard the positive case (T85) and the zero case (T86).

Checked on local, uncommitted edits of `release.yml`, each restored afterwards:

| `release.yml` edit | Result |
| --- | --- |
| assert-one selector (throw unless `npm query` returns one) | 4 pass |
| scoped-only `npm run build --workspace=@kaihacksai/kaal-hosting` | 4 pass |
| scoped-only `npm -w @kaihacksai/kaal-hosting run build` | 4 pass |
| negative control: scoped-only with `|| true` swallowing the failure | T86 and T82 fail (the Case is not vacuous) |

A selector by path, or a workflow with no recognizable Hosting build step, fails T84 or stops the Case loudly; it never passes by accident.

**How it is run:** by hand, `node --test engineering/release/defects/selector-ambiguity.red.mjs`. No suite, lane or script names it, so required CI does not run it, deliberately, until the open question of how a Defect Case lives in `main` without hiding regression (raised on #991) is settled. Until then Engineering runs it before each Engineering promotion or publication and records the Run here; a Case that cannot be found or read fails T84, so rot is visible when it is run.

**Applicability:** Linux and macOS with bash, npm and git. Inapplicable on Windows, because the workflow's build steps run on ubuntu in bash. On Windows the file prints that and exits 3, the repository's does-not-apply status. It does not skip a leaf and it does not pass one.

## Bounds

Not a blocker for Hosting 0.0.1. The supported layout has exactly one Hosting workspace, and a second one would have to be introduced independently of this transition. On `main` (7fa02ac, unscoped), on `kaal/hosting` (a027a43, scoped) and on the projected final tree the query returns one match. The permanent directory `packages/kaal-hosting` is not defective. The limitation is stated in Hosting's release evidence, with the deferral reasoning.

## Correction plan (a separate Change, not planned to ride the Hosting promotion)

1. **When:** after the scoped Hosting package identity is authoritative on `main`.
2. **What:** remove the dual-name logic. The selector names the one scoped package, so a second match cannot be produced by the selector, or it asserts exactly one match. The CPO's direction is to remove the dual-name compatibility.
3. **How it travels:** `release.yml` is `.github`, which travels alone and never rides a ledger entry. The correction is its own `.github`-only Change and its own `.github`-only promotion to `main`, like #949. The Defect record and the Case stay with Engineering and travel through `kaal/engineering`.
4. **Answered when:** engineering/T82 passes at the same Case version as its confirming Run, as its latest observation (see above). It is not edited to pass, and its controls stay.
5. **Not done here:** this record changes no workflow, test or package. It authorizes no promotion or publication.
