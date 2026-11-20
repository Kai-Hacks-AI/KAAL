# Well formed Test Cases: Architecture

**testing/A52** [testing/F152, testing/F153, testing/F154, testing/F155, testing/N34]: one pure module, `lib/form.mjs` (export `./form`), takes `[{ path, text }]` and an optional element list. The command reads files through Hosting (as `run` does), calls it and prints. Nothing is written. The module needs no dependency.

Decisions made in this PLAN, open to CPO review:

- **Report, not enforce.** The command exits 0 with findings, as `run` does with RED. A hook that must block reads `findings.length` itself. I recommend that over a `--fail-on-findings` flag, which would make Testing decide what a finding costs.
- **Elements are supplied.** Testing does not parse intent or requirements documents. The caller hands over the ids that exist; without them the targets are unchecked.
- **The edge word is a constant.** Kai kept `tests:` for now. The check only knows one word, so a later rename to `verifies` is one line here, and an accept-both window is a one-line change.

## What Testing needs from others

- **Deployment** (engineering, one source per skill): the check lives in `packages/kaal-testing`, so the hook and CI can only run it once kaal-testing is deployed from `.kaal/` (N) or `engineering/` (N+1). Until then wiring has nothing to call.
- **Wiring** (engineering, WIRE): a pre-commit hook and a CI step run `kaal-testing check-cases` over the Case files and fail on a non-empty `findings`. Engineering also supplies the element list, from the same place the controls finder reads elements today.
- **A second reader of the edge** (controls, `find-controls.mjs`, and PR 2113's script) parses the first line with its own pattern. Not changed here. Whether they take the rule from this check is for their owners.
