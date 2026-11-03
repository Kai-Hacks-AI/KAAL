# engineering/D1: the Release selector builds the first of two Hosting workspaces

Owner: Engineering (the Release workflow and engine). Instance owned by the context that raised it, as the Owner decided for Defects. Status: **established, RED**. Traces to one Test Case, as a Defect does: [engineering/T82](selector-ambiguity.red.mjs).

Raised by the CPO on #985 (formal comment) after the Owner asked that the Hosting compatibility problem be recorded as a Defect with its precise location, 3 November 2026.

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

## Evidence

[engineering/T82](selector-ambiguity.red.mjs) runs the selector lines the workflow really contains against a scratch repo. It reads the package names each line accepts from the line itself, so it needs no knowledge of the remedy. For this workflow the accepted names are `kaal-hosting` and `@kaihacksai/kaal-hosting`. Its run on this branch:

- control, a workspace the selector accepts is built, and only that one: pass;
- control, no matching workspace stops the build: pass;
- **a tree holding every name the selector accepts: fail**, `the step succeeded and built ["kaal-hosting"] instead of refusing the ambiguity`.

The controls show the fixture runs the real command, so the failure is the ambiguity. Run it with `node --test engineering/release/defects/selector-ambiguity.red.mjs`. No suite, lane or script names the file, so required CI does not run it.

The Case turns GREEN, unchanged, under either remedy. Checked on a local, uncommitted edit of `release.yml` for each, then restored:

| Remedy | T82 |
| --- | --- |
| Keep both names and assert exactly one match (throw unless `npm query` returns one) | 4 pass |
| Scoped only (`--workspace=@kaihacksai/kaal-hosting`) | 4 pass |

With a scoped-only selector the accepted-name list has one entry. The ambiguity case then reports that the selector cannot choose between names, and the controls still require that workspace to build alone and that an absent one fails.

## Bounds

Not a blocker for Hosting 0.0.1. The supported layout has exactly one Hosting workspace, and a second one would have to be introduced independently of this transition. On `main` (7fa02ac, unscoped), on `kaal/hosting` (a027a43, scoped) and on the projected final tree the query returns one match. The permanent directory `packages/kaal-hosting` is not defective. The limitation is stated in Hosting's release evidence, with the deferral reasoning.

## Correction plan (a separate Change, not planned to ride the Hosting promotion)

1. **When:** after the scoped Hosting package identity is authoritative on `main`.
2. **What:** remove the dual-name logic. The selector names the one scoped package, so a second match cannot be produced by the selector, or it asserts exactly one match. The CPO's direction is to remove the dual-name compatibility.
3. **How it travels:** `release.yml` is `.github`, which travels alone and never rides a ledger entry. The correction is its own `.github`-only Change and its own `.github`-only promotion to `main`, like #949. The Defect record and the Case stay with Engineering and travel through `kaal/engineering`.
4. **Answered when:** engineering/T82 turns GREEN against the corrected `release.yml`, unchanged. The Case derives the accepted names from the selector, so it holds for the scoped-only remedy as well as for an assert-one remedy. It is not edited to pass and its controls stay.
5. **Not done here:** this record changes no workflow, test or package. It authorizes no promotion or publication.
