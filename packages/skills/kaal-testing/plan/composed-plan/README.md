# Composed Plan file execution — PLAN

Owner: Testing. Proposed first increment: run explicit Node test files from several Suite memberships once within one Plan invocation, retaining each Suite's reads and every original outcome. Engineering consumes the product for its own CI; it does not own this runner or Testing's model. This PLAN delivers no implementation, live CI adoption, suppression or publication.

## Useful delivery and boundaries

The acceptance example is `A=[a.test.mjs,b.test.mjs]`, `B=[b.test.mjs,c.test.mjs]`. The proposed public API and shipped Skill command actually execute a, b and c once and bind both reads of b to that execution. A failed b fails both Suites; incomplete b makes both unknown; c still executes. Product acceptance proves the observable feature in a fresh installed consumer on Linux, Windows and macOS. It is not a claim that today's production CI wastes one execution or saves any time.

Testing's existing collector already implements the Strategy/Plan/Suite/Case and Test Data model in `lib/model.mjs` (C14/C15/C27). That model is not yet promoted as part of this increment. This proposal does not invent a second semantic model or make that entire collector a dependency. Its manifest is an **execution view** of a consumer-owned Plan/Suite membership, referring to their identities and explicit realization files. It does not define Case identity, trace targets, acceptance allowances, Strategy traversal or history retention.

A concrete Case may test several Intents, Functional/Nonfunctional Requirements, Defects or Architecture elements; multiple traces and Suite memberships do not require multiple executions. Different Test Data/fixtures represent different concrete Cases. This first realization only shares **whole files under one declared execution configuration**. Call separately for different fixture/configuration contexts. An intentional repeatability Case can invoke its subject twice inside one file execution. A child-process boundary alone neither establishes nor prevents equivalence.

Initial scope: direct `.test.mjs` files using Node's native test runner, one consumer cwd and inherited supported environment, one declared subject, native per-file process isolation, no filtering/watch/retry/custom-loader/coverage mode, and no per-Suite lifecycle/configuration overrides. Names/globs/opaque npm scripts are not reverse-engineered. The consumer adopts these Plan semantics explicitly; the new entrypoint does not rewrite an existing package's runner. Migrating any current CI selection is a separate owner-reviewed Engineering Change. Core D1 remains intact.

## Proposed public interface and Skill operation

The package's actual current manifest is `kaal-testing@0.0.1`, despite scoped names in some collector documents. Use that actual identity for this proposal; a scoped rename/publication is separate.

```js
import { runPlan } from 'kaal-testing/plan';
const report = await runPlan({
  id: 'consumer-plan',
  subject: '<consumer-declared SHA-256 subject identity>',
  suites: [
    { id: 'A', files: ['a.test.mjs', 'b.test.mjs'] },
    { id: 'B', files: ['b.test.mjs', 'c.test.mjs'] }
  ]
}, { cwd: '/consumer' });
```

The subject is a caller declaration, not independently attested production provenance. Runtime platform/Node/cwd come from the actual invocation. Files are nonempty normalized cwd-relative paths: no absolute, parent traversal, alternate separators, glob or alias spellings. A file's same spelling/hash appears once per Testing schedule; physical symlink/alias deduplication and actual-loaded-byte attestation are not supplied by a path/source digest.

The BASS entry is shipped at `skills/kaal-testing/scripts/run-plan.mjs`, invoked through the actual installed package path:

```sh
node node_modules/kaal-testing/skills/kaal-testing/scripts/run-plan.mjs ./plan.json
```

The manifest file contains only the API's plain Plan data. Files resolve from the consumer cwd; the command never selects the package's own tests. The script reads/parses the manifest, calls the same public API, emits one `kaal-testing-plan {json}` result line, and exits 0/1/2 for passed/failed/unknown. The Skill teaches when to compose memberships, how to supply a stable subject/common fixture context, how to inspect original results, and when to use separate invocations. No daemon, service, database, new authentication or global cache is proposed.

## Architecture and result contract proposed for review

- `lib/plan-execution.mjs` exports internal async `executePlan(manifest, context, ports)` for isolated implementation testing. It imports no host mechanism or replacement scheduler. Ports are Testing-owned wiring: `read(file, context)`, Foundation `digest(bytes)`, C51 `schedule(requests)`, and `observe(run, context)`. Test ports are not live production receipts.
- `lib/plan.mjs` exports public `runPlan(manifest, {cwd})`. It constructs the actual supported context and binds real Hosting reads/execution, Foundation SHA-256, Testing's public C51 schedule and Testing's Node observer. This concrete binding is mandatory delivery; another inactive ports-only adapter is insufficient.
- Validate the entire nonempty manifest before work: unique nonempty Suite ids, supported fields/path syntax and no per-Suite overrides. Preflight all requested file reads/digests before execution. Invalid/unreadable input returns unknown/exit 2 with findings and no partial execution. Existing callers' other entrypoints are not touched.
- Pass requests `{by: suite.id, files:[{path,sha256}], subject, platform, node}` to C51 unchanged. Do not implement another grouping/key algorithm. Retain/validate its runs/reads so missing readers, invalid references, findings or scheduler errors cannot become an empty successful Plan. No file runs from an invalid schedule.
- Execute every valid planned run once, in schedule order, without retry. A failed/unknown acquisition does not prevent required later files. No cache survives an invocation. The manifest's shared configuration/lifecycle must be suitable for this ordering; the runner does not infer equivalence to unrelated prior Suite commands.
- `report = {id, result, exit, executions, suites, findings}`. Each execution holds `{run, observation}`; each Suite row holds `{id,result,reads:[{file,execution}]}`. Reads point into the one execution table, so observations are not copied/recomputed per reader. Preserve observed Case names/outcomes/reasons, stdout/stderr and original runner exit/provenance. Input data is not mutated.
- An observation is `{result, runnerExit, complete, cases, stdout, stderr, provenance}`. Its producer is the real Node adapter. The pure coordinator retains it by reference, and aggregates file results: failed dominates unknown, unknown dominates passed. Suite results follow only their own reads; Plan result follows all required Suites. Acquisition without an observation remains an explicit unknown gap/finding, never a passed zero-Case observation.
- `runnerExit` records the original child result. The **new Testing entrypoint's** exit is its declared 0/1/2 result contract: a skipped/empty/incomplete file can have native exit 0 but Testing exit 2. This intentionally separates evidence from Testing's acceptance result; it does not rewrite a pre-existing owner evaluator or another runner's exit.
- Reuse Testing's existing `lib/reporter.mjs` and observation responsibility (A5/A7), not a parallel recorder/parser/history store. Add the minimal per-file completion support already required by A7, preserving existing accept()/start/Case-line semantics and their assertions. Native runner events, not test-authored console text, establish completion. Pin the supported runtime/event schema and reject unsupported invocation modes without executing a misleading subset. Keep the original load/runner error and original output; failed-suite/early-exit/interruption/absent completion cannot become GREEN.
- Hosting owns subprocesses and file operations; Foundation owns SHA-256. Add Foundation as an explicit runtime dependency for preparation, not a copied hash. Independently review the narrow architecture declaration change admitting this pure dependency; do not relax host restrictions or silently change the existing boundary's expected outside-import inventory in DO.

Node's [24.x execution model](https://r2.nodejs.org/docs/latest-v24.x/api/test.html#test-runner-execution-model) uses isolated child processes for files; its [summary events](https://r2.nodejs.org/docs/latest-v24.x/api/test.html#event-testsummary) distinguish per-file summaries from the cumulative summary. These are API references, not acceptance evidence for every runtime. A scratch Node v24.22.1 probe observed native exit 0 for an empty file, a real passed Case and a skipped Case. The empty file produced only a file-wrapper pass/global summary; the real/skip examples also produced their own file summaries. This supports the existing A7 completion requirement. It proves neither the proposed runner nor cross-host support.

Source/file hashes are preparation identities. Before/after reads alone do not prove actual loaded bytes or a whole dependency closure. This product executes an explicitly composed manifest; it does not authenticate a production CI group, provide C129 timing receipts, or grant #799 authorization. Supported stable inputs and one execution configuration are the initial caller contract. Existing-run CI reuse and any stronger provenance claim require their own evidence and Owner review.

## Executable boundary before DO

Explicit invocation (not selected by current npm/CI discovery during PLAN):

```sh
node --test packages/skills/kaal-testing/test/plan/composed-plan/execution.cases.mjs packages/skills/kaal-testing/test/plan/composed-plan/consumer.cases.mjs
```

| Local Case | Discriminating behavior |
| --- | --- |
| CP01 | A/B overlap executes a,b,c once, forwards the exact C51 signature, and retains two reads of original b. |
| CP02 | Shared failure fails both readers, preserves original Case/output/exit/provenance, no retry, c still runs. |
| CP03 | Shared incomplete/skip evidence remains unknown for both readers, native exit retained, no retry. |
| CP04 | Separate invocation/fixture context executes again; no cross-call cache. |
| CP05 | Empty/duplicate/unsafe/unsupported manifests and per-Suite flags/fixtures are refused before scheduling/execution. |
| CP06 | Unreadable source prevents partial execution and empty GREEN. |
| CP07 | Invalid/empty/incomplete/throwing schedules retain a visible unknown and every Suite obligation. |
| CP08 | Acquisition error retains later work; established failure dominates the unknown gap. |
| CP09 | Permutation preserves attribution and original Case evidence. |
| CP10 | Concrete public Node API executes fixture bodies once, with both Suites reading the same original b. |
| CP11 | Shipped Skill command performs real work, preserves shared failure and later execution, emits one result and exits nonzero. |
| CP12 | Empty file, early process exit 0 and a native skip remain unknown under the Testing result contract. |

`boundary.json` inventories this contract and immutable Cases/fixtures with Foundation. It is a proposed review boundary, not a self-attestation. On independent Owner acceptance, DO/CHECK must preserve these assertions and fixtures. Later additional edge tests may strengthen coverage without replacing this boundary. Local CP identifiers avoid prematurely allocating global Testing identifiers.

The consumer Cases resolve the actual public package export from the source package by default during DO. For fresh-installed acceptance the once-packed harness sets `KAAL_PLAN_PACKAGE` to the verified installed package root, invokes these exact Cases unchanged, and additionally checks public export/Skill resolution, copied installed bytes and absence of workspace fallback. `fixtures.mjs` imports no source Testing implementation. The isolated coordinator Cases alone consume the real existing C51 function. These roles must remain distinct.

DO must add architecture conformance for permitted/prohibited/undecidable host boundaries, preserving existing conformance; demonstrate each observed pass/fail/unknown/missing-completion path in the actual native adapter; and validate parser failures, exceptions, stdout spoofing and malformed observations with additional tests. No unsupported mode is silently accepted or unknown Case counted as passed. Existing C50 F89–F92/N19 assertions and APIs are unchanged.

Required mutation challenges on the actual implementation: execute b twice (CP01/10/11); lose B's read (CP01/09); erase b failure (CP02/11); retry unknown b (CP03); retain cache across calls (CP04); admit per-Suite fixture/filter override (CP05); omit an unreadable file or schedule reader (CP06/07); stop after acquisition failure (CP08); treat file-wrapper/skip/early exit 0 as passed (CP12). Each kill names an ERR_ASSERTION from the intended Case; missing imports, syntax errors, crashes/timeouts or inert fixture substitutions are not implementation mutation evidence.

## Current test-design evidence

All three JavaScript files pass syntax checks. Explicit discovery finds 12 Cases; all 12 are blocked before behavioural assertions because no coordinator/public API/Skill command is implemented. None is skipped, and this is not implementation RED or GREEN. A scratch-only callable inert coordinator is rejected by CP01–CP09 with nine ERR_ASSERTION failures and no syntax/import/TypeError/ReferenceError blockage. The three public consumer Cases remain blocked by their missing delivery. This validates rejection of inert behavior only. No substitute or loader is committed; actual DO must demonstrate independent behavioural RED/GREEN and the specified mutations against the real implementation. Current CI does not select these proposed .cases.mjs files, so a green PLAN CI is not a claim they passed.

## Source/dependency inventory and focused delivery

Inspected Testing collector: `79524490a219b9f622052047d891f2bd30e631b6`; main at preparation: `01b5528848bb3b59c031bbfcc03f6a88ad7feff2`. Existing `lib/duplicates.mjs` imports nothing and is already on main through #796; its public behavior and Cases are not revised. `lib/model.mjs`, A5/A7/reporting contracts and C38 remain in the full Testing collector; only the minimal admitted reporter/observation contract and this feature may enter a future focused dependency inventory.

Current runtime dependencies are `c8@12.0.0` and `kaal-hosting@0.0.1`. Proposed addition is `@kaihacksai/kaal-foundation@0.0.1` at runtime for the one public hash. Core/Graph/Engineer remain existing development dependencies, not new runtime dependencies. No version, package identity or lockfile changes are made by this PLAN. C38's final installed verification is separate; fresh packed acceptance of this feature is not a claim of complete package/release readiness or permission to publish.

Land this PLAN as an ordinary **squash** Change into existing `kaal/testing`, with independent Owner review and required CI. Preserve that collector and its open work. Before DO, the Owner should accept the proposed **focused main-based `kaal/testing-plan` delivery** and its exact manifest/lockfile/architecture/helper inventory; establish it at current main, carry only this reviewed boundary and necessary accepted dependencies, then perform separately reviewed TDD DO. This PLAN does not establish or promote another collector to evade staleness, cherry-pick pending model/C38/timing work or authorize broad Testing promotion. Any main SYNC uses a merge commit; later focused collector promotion uses squash and the current promotion-order process.

Delivery success requires public export, runnable shipped Skill script, clear instructions/examples, immutable boundary GREEN, independent behavioural RED, discriminating mutations, and once-packed consumer acceptance on Linux/Windows/macOS. A synthetic overlapping consumer establishes product behavior and preventive value. Any advertised CI time saving additionally requires a real adopted path and measured baseline/candidate equivalence; current savings remain unclaimed. No production CI selection, cross-job cache, required-check change, existing owner-runner rewrite, automatic promotion or npm publication is authorized here.
