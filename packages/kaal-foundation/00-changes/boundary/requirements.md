# Foundation Boundary Check: Requirements

Each Requirement names, in brackets, the Intents it serves.

## Functional

- **foundation/F34** [foundation/I14, foundation/I1, foundation/I2]: **The scan: `node dist/test/boundary-check/scan.mjs --target <path>… [--base <dir>]`.** Each `--target` is a file or a directory, given by the caller. A directory is walked for JavaScript and TypeScript sources (`.js .mjs .cjs .ts .mts .cts`); the directories `node_modules` and `.git` are not walked and are counted as skipped. The scan reports a place for each of these rules, and only these:
  - `copy`: a file whose bytes equal Foundation's `sha256.mjs` or `sha256.d.ts` as shipped beside the scan. The place is line 1 of the file.
  - `implementation`: a line that holds SHA-256's first two round constants `0x428a2f98` and `0x71374491` together, or the first of them when the second follows within the next three lines. The place is the line of the first.
  - `crypto`: a line that asks the platform for SHA-256: `createHash("sha256")` (any of the three quote forms, any letter case, with or without the hyphen), or `digest("SHA-256"…)`.

  A line is one place, whatever the number of matches on it. The scan decides nothing by operating system (foundation/N7).
- **foundation/F35** [foundation/I14]: **The result.** The last line of standard output is `kaal-foundation-scan {json}`. The JSON holds:
  - `mode`: `"scan"`;
  - `result`: `complete` when every target was read and at least one source file was read, otherwise `unknown`;
  - `coverage`: `read` (source files read), `unreadable` (each target or file that could not be read, by path) and `skipped` (directories not walked, with the reason);
  - `findings`: each with `id` (`kaal-foundation/<file>:<line>`, the file relative to `--base`, default the current directory, with `/` separators), `rule`, `file`, `line`, `digest` (Foundation's SHA-256 of the line's text without its line terminator, so a later record can bind to the line as it was) and `owner` (foundation/F36).

  Exit codes follow Hosting's scan: 0 when `complete`, including with findings; 2 when `unknown`, and for a usage error (no target). It never exits 1. Findings are not failures, because the scan decides nothing. A scan that read nothing is `unknown`, never a clean result. The human summary line states the coverage and says "none found within this coverage" when there are no findings, and never says "compliant" or "verified".
- **foundation/F36** [foundation/I14]: **Where a place is found, and what is not Foundation's to look at.** Each finding carries `owner`: the `owner.name` of the nearest `ownership.kaal.json` above the file within the base, or `null`. A directory whose `ownership.kaal.json` names Foundation as owner is skipped, reported in `coverage.skipped` with the reason `owner`, and yields no finding: the owner holds the thing. No other path is named or skipped by the scan.
- **foundation/F37** [foundation/I14, foundation/I7]: **Foundation's own Boundary Check record and its documents.** `04-test/boundary-check/boundary-check.md` and `04-test/boundary-check/scan.mjs` ship (`dist/test/boundary-check/`). The record:
  - declares the Boundary Check **Applicable**, with the command (`scan.mjs --target <path>…`), the three rules and what each looks for;
  - names both axes: Foundation's scan pointed at a package or at the repository, and the peers' scans pointed at Foundation;
  - states what the scan does not establish: it does not find a digest computed some other way (for example `createHash` with the algorithm in a variable), does not say a place is a fault, and an empty list is no compliance;
  - states that findings are audit and decisions about them are held by the repository against the finding `id` and `digest`, never in the package, and that only a consequence of a decision (a Defect, a Requirement, or a change to Intent or Architecture) enters the package, through a Change;
  - names no target path and no role.

  The installed `references/operations.md`, the skill (foundation/F15) and the repository's `AGENTS.md` Foundation section (foundation/F16) name the scan by the scoped package's own path and state the same limits and the same place for decisions.

## Non-functional

- **foundation/N20** [foundation/I14]: **Read only.** The scan reads files. It never imports, requires or runs what it reads, writes nothing, touches no network and starts no process.
- **foundation/N21** [foundation/I14, foundation/I1]: **No new reach.** The scan uses only Node's built-in modules and the `sha256.mjs` shipped beside it. The package still declares no dependency (foundation/N2). `scripts/sha256.*` are unchanged (foundation/N9).
- **foundation/N22** [foundation/I14]: **No hard-coded target and no hard-coded role.** Neither the scan, nor the record, nor any shipped document names a repository path, another package's directory, or a decision role. A new target needs no change to Foundation.
