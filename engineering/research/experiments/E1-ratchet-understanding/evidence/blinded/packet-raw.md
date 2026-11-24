# E1 Blinded Evaluation Packet — Raw Verbatim Responses (`s01`–`s10`)

Each section below is one verbatim subject response under a shuffled neutral label (`s01`–`s10`). Arm identities, run IDs, and tool traces are withheld.

---

## Response s01

In software engineering governance, a **ratchet** is an automated quality gate that allows a metric to improve (or stay the same) but prevents it from regressing. Like a mechanical ratchet that only turns in one direction, it locks in progress incrementally—turning every improvement into the new minimum standard.

---

### Purpose
Teams often want to raise engineering standards (e.g., stricter linting, higher test coverage, fewer type errors, smaller bundle sizes) across an existing codebase, but fixing all pre-existing violations at once is impractical and stalls product delivery.

A ratchet solves this by:
- **Stopping the bleeding immediately:** New code cannot make the problem worse.
- **Enabling incremental remediation:** Improvements happen organically as engineers touch existing files, without requiring a "big bang" rewrite.
- **Making governance self-enforcing:** Standards are upheld automatically in CI rather than relying on manual code review vigilance.

---

### Behaviour
A ratchet operates around a **baseline** (a high-water mark for desirable metrics like coverage, or a low-water mark for undesirable metrics like lint errors):

1. **Measure:** On every pull request or build, CI computes the current value of the metric (e.g., number of ESLint warnings, `any` usages, or uncovered lines).
2. **Compare against the baseline:**
   - **Worse than baseline → Fail the build.** The change is blocked until the regression is fixed.
   - **Equal to baseline → Pass the build.** No regression occurred.
   - **Better than baseline → Pass and tighten.** The baseline is updated to the new, improved value (either automatically via a bot/commit or by requiring the PR author to update the checked-in baseline file).

Once tightened, the old threshold can no longer be crossed back.

---

### Limitations
- **Metric gaming (Goodhart's Law):** When a metric becomes a hard gate, engineers may optimize for the number rather than actual quality (e.g., writing assertion-free tests to satisfy a coverage ratchet, or adding `// eslint-disable` comments).
- **Merge conflicts on the baseline:** Storing a single scalar baseline in a checked-in file (like `.ratchet.json`) causes frequent merge conflicts in high-velocity repositories whenever multiple PRs improve the metric concurrently.
- **Stalling at the status quo:** A ratchet prevents *backsliding*, not *stagnation*. If nobody touches legacy modules, the baseline may sit at a poor level indefinitely without dedicated paydown effort.
- **Friction during legitimate refactors:** Some architectural improvements temporarily worsen a metric (e.g., deleting a large, well-tested dead feature can *lower* overall test coverage percentage even though the codebase is healthier). Teams need an explicit, auditable escape hatch for these cases.
- **Blindness to metric validity:** A ratchet only enforces whatever proxy you measure. Ratcheting a noisy or poorly aligned metric (e.g., raw line coverage or cyclomatic complexity) adds friction without improving reliability.

---

### Practical Example: TypeScript Error Ratchet in CI

Suppose a legacy JavaScript/TypeScript codebase wants to enable `strictNullChecks`, which currently produces **412 errors**. Fixing all 412 upfront would block the team for weeks.

**1. Check in a baseline file (`.ratchet-baseline.json`):**
```json
{
  "strictNullCheckErrors": 412
}
```

**2. Run a ratchet script in CI (`scripts/check-ratchet.mjs`):**
```js
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const BASELINE_FILE = '.ratchet-baseline.json';
const baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8'));

// Run tsc with strictNullChecks and count error lines
let output = '';
try {
  execSync('npx tsc --noEmit --strictNullChecks', { encoding: 'utf8' });
} catch (err) {
  output = err.stdout || '';
}
const currentErrors = (output.match(/error TS\d+:/g) || []).length;

if (currentErrors > baseline.strictNullCheckErrors) {
  console.error(
    `Ratchet failed: strictNullChecks errors increased from ` +
    `${baseline.strictNullCheckErrors} to ${currentErrors}.`
  );
  process.exit(1);
}

if (currentErrors < baseline.strictNullCheckErrors) {
  console.error(
    `Nice! Errors dropped from ${baseline.strictNullCheckErrors} to ${currentErrors}. ` +
    `Update ${BASELINE_FILE} to lock in the new baseline.`
  );
  process.exit(1); // Or auto-update on main via a CI bot to avoid PR conflicts
}

console.log(`Ratchet passed (${currentErrors} errors).`);
```

**How it plays out:**
- A developer adds a new feature with 2 null-safety bugs → CI counts `414 > 412` and **fails**.
- Another developer fixes 5 null-safety issues while refactoring a module → CI counts `407 < 412` and prompts them (or a merge-queue bot) to lower the baseline to `407`.
- Once the count reaches `0`, the ratchet script is deleted and `"strictNullChecks": true` is permanently enabled in `tsconfig.json`.

---

## Response s02

### What a Ratchet Is

In software engineering governance, a **ratchet** is a temporary enforcement strategy applied to a preventive control. Like a mechanical ratchet that only turns in one direction, a governance ratchet prevents a system from getting worse while permanently locking in every improvement made over time.

It is not a separate category of control (alongside detective or preventive controls). Instead, as defined in [modes.md](file:///home/antigravity/ChBrain/test-kaal/skills/kaal-controls/references/modes.md), it wraps a pure check with a **baseline filter** in front of the verdict: existing violations are recorded as an allowance (the baseline), and the control blocks anything outside that allowance.

---

### Purpose

- **Adopt strict rules without halting delivery:** When a governance rule is right, but a legacy codebase does not yet comply, enabling a full preventive block immediately would stop all work. A ratchet lets you enforce the rule *from today forward*.
- **Stop the bleeding and lock in progress:** New regressions are blocked immediately, and whenever existing debt is cleaned up, the bar permanently tightens.
- **Keep checks pure and ratchets removable:** By implementing the ratchet as a filter in front of the verdict (such as [`applyBaseline`](file:///home/antigravity/ChBrain/test-kaal/skills/kaal-controls/scripts/judge-mode.mjs#L25-L35)), the underlying check only emits findings. When the baseline reaches zero, you delete the baseline and filter step without touching the check itself.

---

### Behaviour

A check produces a set of uniquely named, stable **findings** (violations). The ratchet compares the current run's `findings` and proposed `baseline` against the last accepted baseline (`previous`, read from the accepted state—never from the change under review). As implemented in [`judgeMode`](file:///home/antigravity/ChBrain/test-kaal/skills/kaal-controls/scripts/judge-mode.mjs#L7-L21), it enforces four rules:

1. **No new regressions (`new-finding`):** Any finding not in the baseline fails and blocks the change. Findings already in the baseline are allowed to pass.
2. **The allowance only shrinks (`baseline-grew`):** The proposed baseline cannot contain anything that was not in `previous`. Attempting to add a new violation—or re-add a previously resolved one—to the baseline blocks the change.
3. **Resolved means removed (`stale-allowance`):** When a change fixes a baselined finding, it must also remove that finding from the baseline in the same change. Leaving an allowance behind fails the check, because a stale entry would silently excuse the violation if it returned later.
4. **Unknown blocks (fail-closed):** If `previous` is missing, unreadable, malformed, or the check cannot produce a verdict, the result is `UNKNOWN` and blocks. Missing evidence is never treated as success.

**Across runs:** Only a passing run advances the accepted baseline (`next`), and each accepted baseline is a subset of the one before it. Failed or unknown runs advance nothing.

**Lifecycle:** A ratchet is explicitly temporary. It declares a `baseline-source`, an `owner`, and an `exit` condition. Once the baseline is empty (`spent: true`), the ratchet scaffolding is deleted and the control continues as an ordinary preventive control.

---

### Limitations

- **Does not guarantee compliance:** A passing ratchet only proves *no new violations* were introduced—it does not mean the rule holds across the codebase.
- **Blind to degradation under the same finding name:** "New" means a finding identifier not in the baseline. If an existing baselined finding gets *worse* while keeping the same name (for example, a file-level finding going from 1 violation to 10), the ratchet will pass it. Finding names must be fine-grained and stable enough to catch meaningful regressions.
- **Does not remediate debt on its own:** A ratchet holds the line and locks in cleanup, but paying down existing findings is separate work. Without active remediation, a temporary ratchet can ossify into a permanent exception list.
- **Requires human retirement:** Tooling can report when a baseline is empty, but nothing automatically deletes the ratchet; the owner still has to notice and transition the control to standard preventive mode.
- **Operational friction:** Requires storing and reading `previous` from a trusted accepted state, maintaining stable finding names across refactors, and asking developers who incidentally fix a baselined issue to update the baseline in the same change.
- **Unsuitable for hard invariants:** Critical security, safety, or legal rules where *existing* violations are unacceptable should not be ratcheted—they must be fixed or blocked outright.

---

### Practical Example

Suppose a team adopts a rule forbidding explicit `any` types in TypeScript (`no-explicit-any`), enforced via [judge-mode.mjs](file:///home/antigravity/ChBrain/test-kaal/skills/kaal-controls/scripts/judge-mode.mjs) at integration time. Two legacy files currently violate the rule, so the team creates an initial accepted baseline (`previous`):

```json
[
  "src/auth.ts#parseToken:no-explicit-any",
  "src/billing.ts#calcTax:no-explicit-any"
]
```

Here is how the ratchet behaves across five consecutive changes:

| Scenario | Check `findings` | Proposed `baseline` | Verdict | Reason / Outcome |
| :--- | :--- | :--- | :--- | :--- |
| **1. Unrelated feature** | `["src/auth.ts#parseToken:...", "src/billing.ts#calcTax:..."]` | Same as `previous` | `PASS` | Known debt passes; `next` stays unchanged. |
| **2. New violation added** | Adds `"src/orders.ts#create:..."` | Same as `previous` | `FAIL` | Blocked with `new-finding`. |
| **3. Attempt to expand baseline** | Includes `"src/orders.ts#create:..."` | Adds `"src/orders.ts#create:..."` | `FAIL` | Blocked with `baseline-grew`. |
| **4. Fix `auth.ts`, forget baseline** | `["src/billing.ts#calcTax:..."]` | Still has both entries | `FAIL` | Blocked with `stale-allowance`. |
| **5. Fix `auth.ts` & shrink baseline** | `["src/billing.ts#calcTax:..."]` | `["src/billing.ts#calcTax:..."]` | `PASS` | Accepted baseline shrinks to `["src/billing.ts#calcTax:..."]`. If `auth.ts` later reintroduces `any`, it is now a `new-finding` and blocks. |

Finally, when `src/billing.ts#calcTax` is fixed and the baseline becomes `[]`, [`judgeMode`](file:///home/antigravity/ChBrain/test-kaal/skills/kaal-controls/scripts/judge-mode.mjs#L17-L20) returns `PASS` with `spent: true` and `then: "preventive"`. The team deletes the baseline file and the ratchet step, leaving the `no-explicit-any` check running as a standard preventive control.

---

## Response s03

In software engineering governance, a **ratchet** is an automated control—usually enforced in CI/CD—that prevents a codebase metric from regressing while automatically tightening the allowed threshold whenever the metric improves. Like a mechanical ratchet, it allows movement in only one direction: toward the desired engineering standard.

---

### Purpose
Ratchets solve the **"boil the ocean" problem** in large or legacy codebases. When an organization wants to adopt a new standard (e.g., stricter linting, higher test coverage, fewer architectural violations, or zero `any` types), fixing thousands of pre-existing issues upfront is rarely feasible.

A ratchet lets teams:
- **Stop the bleeding immediately** by blocking new violations without halting feature work.
- **Lock in incremental progress** so cleanups aren't quietly undone by later changes.
- **Automate governance**, replacing subjective code-review policing with deterministic CI gates.

---

### Behaviour
A ratchet operates as a three-step loop tied to version control:

1. **Establish a baseline**: Capture the current state of a metric (e.g., `340` ESLint warnings, `71.2%` line coverage, or `18` circular dependencies) in a tracked baseline file or metric store.
2. **Block regressions**: On every pull request, CI recomputes the metric. If it is worse than the baseline (e.g., `341` warnings or `70.9%` coverage), the build fails.
3. **Tighten on improvement**: If a PR improves the metric (e.g., drops warnings to `332`), the ratchet advances—either a bot updates the baseline automatically, or CI prompts the author to update the baseline file to `332` before merging. That new value becomes the permanent ceiling/floor going forward.

Ratchets come in two main forms:
- **Aggregate (watermark) ratchets**: Track a single number (total count or percentage). Simple to build, but coarse.
- **Granular (allowlist/baseline-diff) ratchets**: Track violations per file or fingerprint each existing issue (e.g., PHPStan/Psalm baselines, Semgrep/CodeQL baselines). These block *any* new violation even if unrelated ones are fixed.

---

### Limitations
- **Debt trading (aggregate ratchets)**: If a ratchet only tracks a total count, a developer who fixes 3 old warnings can introduce 3 new—potentially more severe—ones without failing CI.
- **No guarantee of progress**: A ratchet prevents backsliding, not stagnation. Without dedicated effort or incentives, a codebase can sit at its initial baseline indefinitely.
- **Goodhart's Law / gaming**: Teams may game the metric rather than improve quality (e.g., writing assertion-free tests to protect coverage, or adding `// eslint-disable` comments to bypass a lint ratchet).
- **Merge conflicts**: A single shared baseline file updated on every improving PR creates frequent merge conflicts in high-velocity repositories.
- **Brittle with noisy metrics**: Metrics that fluctuate non-deterministically (such as flaky coverage, timing benchmarks, or bundle sizes affected by transitive dependencies) cause false positives and erode developer trust.
- **Need for escape hatches**: Legitimate regressions occasionally happen (e.g., adding a required security library increases bundle size). Without a lightweight, auditable override process, teams will work around or disable the ratchet.

---

### Practical Example: Eliminating `@typescript-eslint/no-explicit-any`

Suppose a legacy TypeScript repository has **412** uses of `any`. Turning the rule on as a hard error would break the build everywhere, so the team introduces a ratchet.

**1. Baseline file committed to the repo (`.ratchet/no-explicit-any.json`):**
```json
{
  "maxViolations": 412
}
```

**2. CI check script (`scripts/check-any-ratchet.mjs`):**
```js
import fs from "node:fs";
import { execSync } from "node:child_process";

const baselinePath = ".ratchet/no-explicit-any.json";
const { maxViolations } = JSON.parse(fs.readFileSync(baselinePath, "utf8"));

// Run ESLint for the target rule and count occurrences
const output = execSync(
  'npx eslint "src/**/*.ts" --rule "@typescript-eslint/no-explicit-any: warn" --format json',
  { encoding: "utf8" }
);
const results = JSON.parse(output);
const current = results.reduce(
  (sum, file) =>
    sum + file.messages.filter((m) => m.ruleId === "@typescript-eslint/no-explicit-any").length,
  0
);

if (current > maxViolations) {
  console.error(
    `Ratchet failed: found ${current} 'any' usages (baseline max: ${maxViolations}). Remove the new usages.`
  );
  process.exit(1);
}

if (current < maxViolations) {
  console.error(
    `Great work! 'any' usages dropped from ${maxViolations} to ${current}. ` +
      `Update ${baselinePath} to {"maxViolations": ${current}} to lock in this improvement.`
  );
  process.exit(1);
}

console.log(`Ratchet passed (${current}/${maxViolations}).`);
```

**How it plays out in practice:**
- **PR A** introduces a new `any` (`413 > 412`) → **CI fails**; author must type it properly.
- **PR B** touches unrelated code (`412 === 412`) → **CI passes** without friction.
- **PR C** refactors a module and removes 10 `any` usages (`402 < 412`) → **CI prompts** the author (or a CI bot commits) to lower `maxViolations` to `402`.
- Over months, the baseline ratchets down to `0`, at which point the team removes the ratchet script and promotes `@typescript-eslint/no-explicit-any` to a permanent `error`.

---

## Response s04

In software engineering governance, a **ratchet** is a temporary strategy for enforcing a preventive control on a system that does not yet meet the rule. Rather than blocking all work until every historical violation is fixed, a ratchet records the current violations as a **baseline** (an allowance) and enforces one-way progress: nothing new may break, and any improvement permanently tightens the baseline.

In this workspace, the model is specified in [modes.md](file:///home/antigravity/ChBrain/test-kaal/skills/kaal-controls/references/modes.md) and implemented in [`judgeMode`](file:///home/antigravity/ChBrain/test-kaal/skills/kaal-controls/scripts/judge-mode.mjs#L7-L21) / [`applyBaseline`](file:///home/antigravity/ChBrain/test-kaal/skills/kaal-controls/scripts/judge-mode.mjs#L25-L35).

---

### Purpose

A ratchet solves the **"legacy adoption" problem** in governance:

* A rule is valuable (e.g., strict type safety, zero circular dependencies, no critical linter violations), **but** the existing codebase already has dozens or hundreds of violations.
* Turning on a strict preventive gate immediately would block every pull request and halt delivery.
* Running the check only in *detective* (report-only) mode avoids blocking, but allows technical debt to keep growing.

A ratchet bridges the gap: it **stops the bleeding immediately**, **locks in every cleanup**, and provides a clear path to a standard preventive control once the baseline reaches zero.

---

### Behaviour

A check emits deterministic, stably named **findings** (what is violated). A ratchet sits as a **filter in front of the verdict**—keeping the underlying check pure—and enforces four rules across runs:

1. **No new regressions:** Any finding *not* in the baseline blocks the change (`FAIL`). Findings already present in the baseline are allowed to pass.
2. **The allowance only shrinks:** The proposed baseline is compared against the **last accepted baseline** (read from the accepted state such as `main`, never solely from the branch under review). Adding any entry that was not in the previous accepted baseline is rejected (`baseline-grew`).
3. **Resolved means removed:** When a change fixes a baselined finding, that entry must be removed from the baseline in the same change. Leaving a resolved finding in the baseline fails (`stale-allowance`), preventing old allowances from silently excusing a future regression.
4. **Unknown blocks (fail-closed):** If the previous baseline is missing, unreadable, malformed, or the check itself fails to run, the verdict is `UNKNOWN` and blocks. Missing evidence is never treated as a pass.

**Lifecycle & removability:**
* Each passing run produces a `next` baseline that is a subset of the previous one; failed runs never advance the accepted baseline.
* Because the ratchet is a wrapper around a pure check, when the baseline becomes empty the filter is an identity—you simply delete the baseline and ratchet step, leaving the underlying check untouched as an ordinary preventive control.

---

### Limitations

* **Does not prove compliance:** A passing ratchet only certifies that *no new violations were introduced*. It does not mean the system satisfies the rule.
* **Sensitive to finding granularity:** "New" means a finding identifier not in the baseline. If finding names are too coarse (for example, `src/billing.ts` instead of `src/billing.ts:no-explicit-any:calculateTax`), a known violation can get worse under the same name and still pass.
* **Does not fix debt by itself:** A ratchet only prevents backsliding and preserves gains; actually paying down the baseline requires separate remediation work.
* **Not self-terminating:** A ratchet is meant to be temporary (declaring a `baseline-source`, `owner`, and `exit` condition as in [modes.md](file:///home/antigravity/ChBrain/test-kaal/skills/kaal-controls/references/modes.md)), but nothing automatically enforces a deadline or retires it—someone must actively drive the baseline to zero and remove the ratchet scaffolding.
* **Baseline integrity must be protected:** If a contributor can freely overwrite the accepted reference baseline or downgrade the control from preventive to detective without review, the ratchet can be bypassed.
* **Churn friction:** Strict stale-allowance checks mean unrelated refactors that accidentally fix a baselined issue require updating the baseline file in the same change.

---

### Practical Example

Suppose a team wants to enforce the ESLint rule `no-explicit-any` across a TypeScript repository, but the codebase currently has 3 legacy occurrences.

#### 1. Establish the initial baseline (on `main`)
The check emits stable finding IDs, and the team commits them as the initial accepted baseline (`baseline.json`):

```json
[
  "src/auth/token.ts#parsePayload",
  "src/billing/invoice.ts#formatLine",
  "src/legacy/import.ts#mapRow"
]
```

The CI gate runs the pure check, then passes `findings`, the branch's `baseline.json`, and `main`'s accepted `previous` baseline into the ratchet filter (like [`judge-mode.mjs`](file:///home/antigravity/ChBrain/test-kaal/skills/kaal-controls/scripts/judge-mode.mjs#L36-L48)).

#### 2. Four scenarios in Pull Requests

| Scenario | Check Findings | Branch `baseline.json` | Verdict | Why |
| :--- | :--- | :--- | :--- | :--- |
| **A. Unrelated feature** | Same 3 findings | Unchanged (3 entries) | `PASS` | No new findings, baseline unchanged. |
| **B. New regression** | 3 old + `src/orders/cart.ts#addItem` | Unchanged (3 entries) | `FAIL` (`new-finding`) | `addItem` is not in the baseline. |
| **C. Trying to excuse it** | 3 old + `src/orders/cart.ts#addItem` | Adds `src/orders/cart.ts#addItem` (4 entries) | `FAIL` (`baseline-grew`) | Baseline contains an entry not in `main`'s accepted baseline. |
| **D. Fixing a violation (forgetting baseline)** | 2 findings (`parsePayload` fixed) | Still has all 3 entries | `FAIL` (`stale-allowance`) | `parsePayload` is gone; keeping its allowance would allow it to regress later. |
| **E. Fixing a violation (cleanly)** | 2 findings (`parsePayload` fixed) | Removes `parsePayload` (2 entries) | `PASS` | Accepted baseline shrinks to 2 entries on merge. |

#### 3. Exit / Retirement
Once `formatLine` and `mapRow` are fixed, `baseline.json` becomes `[]` (`spent: true`). The owner removes `baseline.json` and the ratchet filter step from CI, leaving the `no-explicit-any` check running as a standard preventive control.

---

## Response s05

In software engineering governance, a **ratchet** is a temporary enforcement strategy for a **preventive control**. Like its mechanical namesake, it allows movement in only one direction: quality can stay the same or improve, never regress.

In this workspace's KAAL governance model (see [modes.md](file:///home/antigravity/ChBrain/test-kaal/skills/kaal-controls/references/modes.md)), a ratchet is not a separate control type or station mode—it is a temporary strategy (`strategy: ratchet`) applied to a preventive control until the governed system reaches full compliance.

---

### Purpose

When a governance rule is right, but an existing codebase or system already violates it in many places, turning on a strict preventive gate immediately would halt all delivery. A ratchet solves this by:

- **Stopping the bleeding immediately** without requiring a "big bang" remediation up front.
- **Locking in progress** so that every fixed violation permanently raises the bar.
- **Providing a clean path to full enforcement** by acting as a removable filter in front of an otherwise pure check (as implemented in [`applyBaseline`](file:///home/antigravity/ChBrain/test-kaal/skills/kaal-controls/scripts/judge-mode.mjs#L25-L35)).

---

### Behaviour

A check emits a list of **findings**—each with a stable identifier from run to run. The ratchet records today's existing findings as an allowance (the **baseline**) and evaluates every change against four rules (see [`judgeMode`](file:///home/antigravity/ChBrain/test-kaal/skills/kaal-controls/scripts/judge-mode.mjs#L7-L21)):

1. **No new regressions:** Any finding *not* in the baseline blocks the change (`FAIL` / `new-finding`). Known findings in the baseline are allowed to pass.
2. **The allowance only shrinks:** The baseline in the change under review is compared against the **last accepted baseline** (`previous`, read from the accepted state such as `main`, never from the PR itself). Adding any entry that was not in `previous` blocks (`baseline-grew`).
3. **Resolved means removed:** When a finding is fixed, its allowance must be removed from the baseline in the same change. Keeping an allowance for a finding that no longer exists fails (`stale-allowance`), because leaving it behind would silently excuse the violation if it returned later.
4. **Unknown blocks (fail-closed):** If the check cannot run, or if the accepted baseline is missing, unreadable, or incompatible, the verdict is `UNKNOWN` and blocks. Missing evidence never counts as a pass.

**Lifecycle:** Because the ratchet sits as a filter in front of the verdict, an empty baseline (`[]`) is an identity operation. Once all findings are resolved (`spent: true`), the ratchet and its baseline are deleted and the control continues as an ordinary preventive gate without touching the underlying check.

---

### Limitations

- **Does not prove compliance:** A passing ratchet only proves that *nothing new* was broken—not that the underlying rule holds across the system.
- **Granularity blind spots:** "New" is defined by finding identity. If a finding is named too broadly (e.g., `src/auth.ts` instead of `src/auth.ts:line-or-symbol:rule`), an existing violation can get worse under the same name and still pass.
- **Does not fix existing debt on its own:** A ratchet prevents backsliding; actually burning down the baseline requires separate engineering work.
- **Risk of becoming permanent:** Nothing automatically retires a ratchet. Even when governance requires declaring `baseline-source`, `owner`, and `exit` criteria (as in [declaring-controls.md](file:///home/antigravity/ChBrain/test-kaal/skills/kaal-controls/references/declaring-controls.md)), someone must actively notice an empty baseline—or an aging one—and close it out.
- **Workflow friction:** Strict stale-allowance enforcement means a developer who opportunistically fixes a legacy issue must also update the baseline file in the same change, and shared baseline files can create merge conflicts in high-churn repositories.
- **Depends on a trusted reference:** If the process does not read `previous` from a protected, accepted state (e.g., the target branch), a change could tamper with both the baseline and its reference to bypass the ratchet.

---

### Practical Example

Suppose a team wants to enforce a preventive rule: **no unsafe `eval()` calls anywhere in the repository**. The legacy codebase already has two violations, so blocking immediately would stop all PRs.

#### 1. Establish the initial baseline
The team declares a preventive control with `strategy: ratchet` and commits the current findings to the accepted baseline on `main`:

```json
[
  "src/legacy/calc.js:no-eval",
  "src/legacy/report.js:no-eval"
]
```

#### 2. How changes are judged

| Scenario | Check Findings | Proposed Baseline | Verdict & Reason |
| :--- | :--- | :--- | :--- |
| **Unrelated PR** | `calc.js`, `report.js` | `calc.js`, `report.js` | **`PASS`** — Only known findings; baseline unchanged. |
| **New violation added** in `src/api/parse.js` | `calc.js`, `report.js`, `parse.js` | `calc.js`, `report.js` | **`FAIL`** (`new-finding`) — `parse.js` is not in the baseline. |
| **Attempt to grandfather** `src/api/parse.js` | `calc.js`, `report.js`, `parse.js` | `calc.js`, `report.js`, `parse.js` | **`FAIL`** (`baseline-grew`) — `parse.js` was not in `previous` on `main`. |
| **Fixes `calc.js`**, forgets to update baseline | `report.js` | `calc.js`, `report.js` | **`FAIL`** (`stale-allowance`) — `calc.js` is resolved and must be removed. |
| **Fixes `calc.js`** and removes it from baseline | `report.js` | `report.js` | **`PASS`** — Accepted baseline shrinks to `["src/legacy/report.js:no-eval"]`. |
| **Later PR re-introduces** `eval()` in `calc.js` | `calc.js`, `report.js` | `report.js` | **`FAIL`** (`new-finding`) — Once removed, `calc.js` is treated as new. |

#### 3. Exit the ratchet
When a final PR removes `eval()` from `src/legacy/report.js` and updates the baseline to `[]`, the ratchet is spent. The owner deletes the baseline file and the `strategy: ratchet` filter; the `no-eval` check remains untouched and now runs as a standard preventive control.

---

## Response s06

In software engineering governance, a **ratchet** is an automated quality gate that allows a metric to move in only one direction—toward improvement—while blocking any change that makes it worse.

Borrowed from the mechanical ratchet (a gear that turns forward freely but locks against moving backward), it enforces a **"never get worse"** rule rather than an all-or-nothing perfection standard.

---

### Purpose
Large or legacy codebases rarely start in an ideal state. Enforcing a strict rule immediately (e.g., *"zero lint warnings"*, *"80% test coverage"*, *"strict TypeScript everywhere"*) often requires a massive, risky, multi-month rewrite that stalls product delivery.

A ratchet solves this by:
- **Stopping the bleeding immediately**: New code cannot add to existing technical debt.
- **Enabling incremental remediation**: Teams can pay down debt continuously as they touch files, rather than in a single "big bang" effort.
- **Lowering adoption friction**: New standards, linters, security policies, or type checks can be rolled out on day one without fixing every historical violation first.

---

### Behaviour
A ratchet operates around a tracked **baseline** (or high-water mark) stored in version control and checked in CI:

1. **Baseline capture**: The current state of the metric is recorded (e.g., `412` ESLint warnings, `62.4%` test coverage, or a list of files exempt from a rule).
2. **Enforcement on every PR**:
   - **Worse than baseline** (e.g., `413` warnings or `62.0%` coverage) → **CI fails**; the change is blocked.
   - **Equal to baseline** (`412` warnings) → **CI passes**.
   - **Better than baseline** (e.g., `405` warnings or `63.1%` coverage) → **CI passes**, and the baseline is tightened to the new value (`405` or `63.1%`).
3. **One-way progression**: Over time, as developers opportunistically clean up code, the threshold tightens until it reaches the target state (e.g., `0` violations), at which point the ratchet can be replaced with a simple strict check.

---

### Limitations
- **Does not guarantee progress**: A ratchet prevents regression, but it does not *force* improvement. Without incentives or dedicated cleanup work, a metric can stay frozen at its initial baseline indefinitely.
- **Metric gaming (Goodhart's Law)**: If the tracked metric is a weak proxy for quality, developers may game it (e.g., writing meaningless assertions to satisfy a coverage ratchet, or disabling lint rules inline to keep warning counts flat).
- **Merge conflicts and baseline churn**: Storing a single global number or snapshot file in Git can cause frequent merge conflicts on active repos if multiple PRs update the baseline simultaneously.
- **Friction during legitimate changes**: Large refactors, code deletions, or upgrading a linter/compiler can temporarily worsen a metric (for example, deleting well-tested dead code can drop overall coverage percentage), requiring an explicit override mechanism.
- **Granularity blind spots**: A coarse global counter allows trade-offs—someone could fix 2 trivial warnings in an old file and introduce 2 severe ones in new code, keeping the total unchanged. (File-level or violation-level baselines mitigate this.)

---

### Practical Example: TypeScript `strict` / Lint Violation Ratchet
Suppose a team wants to enable a new ESLint rule (`no-explicit-any`), but the codebase currently has **147** existing violations.

1. **Record the baseline** in the repository (e.g., `.eslint-ratchet.json`):
   ```json
   {
     "no-explicit-any": 147
   }
   ```

2. **Run a ratchet script in CI**:
   ```bash
   #!/usr/bin/env bash
   set -euo pipefail

   BASELINE=$(jq '."no-explicit-any"' .eslint-ratchet.json)
   CURRENT=$(npx eslint . --format json | jq '[.[].messages[] | select(.ruleId == "no-explicit-any")] | length')

   echo "no-explicit-any violations: current=$CURRENT, baseline=$BASELINE"

   if [ "$CURRENT" -gt "$BASELINE" ]; then
     echo "FAIL: Violations increased by $((CURRENT - BASELINE)). Please fix new occurrences."
     exit 1
   fi

   if [ "$CURRENT" -lt "$BASELINE" ]; then
     echo "IMPROVED: Update .eslint-ratchet.json from $BASELINE to $CURRENT to lock in the gain."
     # Optionally fail with a message prompting the author to update the baseline,
     # or have a CI bot automatically commit the tightened baseline on merge to main.
   fi
   ```

3. **Result over time**:
   - **PR A** introduces a new `any` (`148 > 147`) → **Blocked**.
   - **PR B** adds a new feature without `any` (`147 == 147`) → **Passes**.
   - **PR C** refactors an old module and removes 5 `any` usages (`142 < 147`) → **Passes**, and the baseline tightens to `142`.
   - Eventually the baseline hits `0`, the ratchet script is deleted, and `no-explicit-any` becomes a standard error rule.

---

## Response s07

### What a Ratchet Is

In software engineering governance, a **ratchet** is a temporary enforcement strategy for a preventive control. Just like a mechanical ratchet allows motion in only one direction, a governance ratchet allows compliance to improve (or stay flat) while blocking any regression.

Rather than rewriting a check to ignore legacy issues, a ratchet is implemented as a **filter in front of the verdict**: the underlying check remains pure and emits all findings, while the ratchet compares those findings against an accepted **baseline** (an explicit allowance of known violations) and only lets the change pass if the baseline stays honest and no new findings appear.

*(In this workspace, this model is documented in [modes.md](file:///home/antigravity/ChBrain/test-kaal/skills/kaal-controls/references/modes.md) and implemented by [`judgeMode`](file:///home/antigravity/ChBrain/test-kaal/skills/kaal-controls/scripts/judge-mode.mjs#L7-L21) and [`applyBaseline`](file:///home/antigravity/ChBrain/test-kaal/skills/kaal-controls/scripts/judge-mode.mjs#L25-L35).)*

---

### Purpose

A ratchet solves the **"legacy debt vs. strict enforcement"** dilemma:

- **Adopt the right rule immediately** without halting all delivery to fix hundreds of pre-existing violations first.
- **Stop the bleeding** by ensuring no new violations enter the codebase while remediation happens incrementally.
- **Lock in progress** so that once an existing violation is fixed, it cannot silently reappear later.
- **Enable clean graduation**: once the baseline reaches zero, the ratchet filter and baseline are deleted, leaving a standard preventive control with no changes to the check itself.

---

### Behaviour

A well-designed ratchet follows five core rules across runs:

1. **No new regressions:** Every finding emitted by the check has a stable identifier. Findings present in the baseline pass; any finding *not* in the baseline blocks the change.
2. **The allowance only shrinks:** The proposed baseline is compared against the last *accepted* baseline (read from the trusted target branch/state, never solely from the PR under review). Adding an item to the baseline is rejected as baseline growth.
3. **Resolved means removed:** When a previously baselined finding is fixed, its entry must be removed from the baseline in the same change. Leaving a stale allowance fails the check—otherwise that leftover entry would excuse the violation if it returned later.
4. **Fail closed on unknown:** If the accepted baseline is missing, unreadable, malformed, or the check cannot produce a verdict, the ratchet returns `UNKNOWN` and blocks. Missing evidence is never treated as success.
5. **Temporary lifecycle:** A ratchet declares its trusted `baseline-source`, an `owner`, and an `exit` condition. When the baseline is empty, the ratchet is spent and removed so the control runs as an ordinary preventive gate.

---

### Limitations

- **Does not guarantee compliance:** A passing ratchet only proves *no new regressions*, not that the system satisfies the rule.
- **Granularity blind spots:** Because "new" means a finding identifier not in the baseline, coarse identifiers hide worsening debt. For example, if findings are keyed only by file path (`src/auth.ts`), adding five more violations inside `src/auth.ts` still matches the same key and passes. Finding names must be fine-grained enough to matter.
- **Does not fix debt on its own:** A ratchet prevents backsliding, but paying down the baseline is separate planned work. Without active ownership, a ratchet can sit indefinitely with a non-empty baseline.
- **Refactoring friction:** Renaming, moving, or splitting files can change finding identifiers, causing existing violations to look "new" and forcing contributors to either fix them on the spot or carefully reconcile the baseline.
- **Needs governance around the baseline itself:** If anyone can freely edit the baseline source or switch the control back to detective mode without review, the ratchet is easily bypassed.

---

### Practical Example

Suppose a team adopts a preventive rule: **no unsafe SQL string interpolation (`no-raw-sql`)**. Running the check on `main` today produces two existing findings:

```json
// Accepted baseline on main (previous)
[
  "src/reports/export.ts:buildQuery",
  "src/legacy/search.ts:findUsers"
]
```

Here is how the ratchet behaves on subsequent pull requests:

| Scenario | Check Findings | Proposed Baseline | Verdict | Why |
| :--- | :--- | :--- | :--- | :--- |
| **1. Unrelated change** | `export.ts:buildQuery`, `search.ts:findUsers` | Unchanged | **PASS** | All findings are in the accepted baseline; nothing grew or went stale. |
| **2. New violation added** | `export.ts:buildQuery`, `search.ts:findUsers`, **`billing.ts:getInvoice`** | Unchanged | **FAIL** | `new-finding`: `billing.ts:getInvoice` is not in the baseline. |
| **3. Attempt to expand baseline** | `export.ts:buildQuery`, `search.ts:findUsers`, `billing.ts:getInvoice` | Adds `billing.ts:getInvoice` | **FAIL** | `baseline-grew`: baseline contains an entry not in `previous`. |
| **4. Debt fixed, baseline forgotten** | `search.ts:findUsers` | Still lists `export.ts:buildQuery` | **FAIL** | `stale-allowance`: `export.ts:buildQuery` was resolved and must be removed from the baseline. |
| **5. Debt fixed properly** | `search.ts:findUsers` | `["src/legacy/search.ts:findUsers"]` | **PASS** | Baseline shrinks to `next`. If `export.ts:buildQuery` ever returns, it is now a new finding and blocks. |
| **6. Final debt fixed** | `[]` | `[]` | **PASS (spent)** | Baseline is empty. The owner deletes the baseline file and ratchet filter; `no-raw-sql` continues as a standard preventive check. |

---

## Response s08

In software engineering governance, a **ratchet** is a temporary enforcement strategy for a preventive control that allows a team to adopt a strict rule incrementally. Rather than blocking all work until a codebase is 100% compliant, a ratchet records existing violations as a **baseline (allowance)** and guarantees that quality can only move in one direction: **no new violations are allowed, and every fixed violation permanently tightens the standard**.

In this workspace, the ratchet model is documented in [modes.md](file:///home/antigravity/ChBrain/test-kaal/skills/kaal-controls/references/modes.md) and implemented in [`judgeMode`](file:///home/antigravity/ChBrain/test-kaal/skills/kaal-controls/scripts/judge-mode.mjs#L7-L21) and [`applyBaseline`](file:///home/antigravity/ChBrain/test-kaal/skills/kaal-controls/scripts/judge-mode.mjs#L25-L35).

---

### Purpose

- **Avoid "stop-the-world" freezes:** When a governance rule is valid (e.g., strict type checking, security rules, architectural boundaries) but a legacy system already has hundreds of violations, turning it on as a hard preventive gate immediately halts delivery. A ratchet lets work continue safely.
- **Stop the bleeding immediately:** Existing debt is grandfathered in, while all new changes are held to the target standard from day one.
- **Lock in progress monotonically:** As teams pay down debt, the baseline shrinks. Improvements cannot be silently undone by later changes.
- **Provide a clean path to full enforcement:** A ratchet is designed to be temporary—once the baseline reaches zero, the ratchet scaffolding is deleted and the check becomes an ordinary preventive control.

---

### Behaviour

A ratchet sits as a filter in front of a pure check's findings (each finding identified by a stable name) and compares the current run against the **last accepted baseline** (e.g., from `main`, never solely from the PR under review):

1. **No new regressions:** Any finding not present in the baseline blocks the change (`FAIL` / `new-finding`). Findings already in the baseline are tolerated for now (`PASS`).
2. **The allowance only shrinks:** The proposed baseline cannot contain anything that was not in the last accepted baseline. Adding an entry to excuse a new violation blocks (`FAIL` / `baseline-grew`).
3. **Resolved means removed:** If a finding no longer occurs, its entry must be removed from the baseline in the same change. Leaving a resolved item in the baseline fails (`FAIL` / `stale-allowance`), because a stale allowance would silently permit the violation to return later. Once removed, if the issue reappears, it is treated as new and blocks.
4. **Unknown blocks (fail-closed):** If the accepted baseline is missing, unreadable, malformed, or the underlying check fails to produce findings, the verdict is `UNKNOWN` and blocks. Missing evidence is never treated as success.
5. **Removable by design:** Because the ratchet is a filter around an unmodified check (see [`applyBaseline`](file:///home/antigravity/ChBrain/test-kaal/skills/kaal-controls/scripts/judge-mode.mjs#L25-L35)), an empty baseline makes the filter a no-op. Retiring the ratchet only requires removing the filter and baseline file—the check itself stays untouched.

---

### Limitations

- **Proves "no worse," not "compliant":** A passing ratchet only guarantees no *new* violations were introduced; it does not mean the system satisfies the rule.
- **Does not pay down debt on its own:** It prevents backsliding, but remediation is separate work. Without active paydown (and an owner/plan), a "temporary" ratchet can stagnate indefinitely.
- **Sensitive to finding granularity:**
  - *Too coarse* (e.g., file-level IDs like `src/auth.ts`): An existing violation can get worse under the same name and still pass.
  - *Too brittle* (e.g., raw line numbers): Unrelated edits shift line numbers and cause noisy false failures.
- **Does not self-terminate:** Even when the baseline hits empty, someone or an automated process must notice and remove the ratchet configuration and baseline file.
- **Requires a trusted baseline source:** The reference baseline must come from the accepted state (such as the target branch). If a check only reads the baseline from the PR being evaluated, contributors could append new violations to bypass the gate.
- **Baseline merge friction:** When multiple concurrent changes fix different violations, they all edit the same baseline file, which can create merge conflicts unless formatted cleanly (e.g., sorted one-per-line lists).

---

### Practical Example

Suppose a team adopts a rule banning raw SQL string interpolation (`no-raw-sql`), but the codebase currently has 3 legacy occurrences.

#### 1. Establish the accepted baseline (on `main`)
The check emits stable, scoped finding IDs, which are saved as the initial accepted baseline:
```json
[
  "no-raw-sql:src/reports/export.ts:buildExportQuery",
  "no-raw-sql:src/billing/invoice.ts:fetchUnpaid",
  "no-raw-sql:src/admin/audit.ts:searchLogs"
]
```
The control is enabled with `strategy: ratchet`, an `owner`, a `baseline-source` (pointing to `main`), and an `exit` condition (*"becomes a plain preventive control when the baseline is empty"*).

#### 2. How the ratchet responds to changes

| Scenario | Check Findings | PR Baseline | Verdict & Why |
| :--- | :--- | :--- | :--- |
| **A. Unrelated feature** | Same 3 legacy findings | Unchanged (3 items) | **PASS** — all findings are known; baseline unchanged. |
| **B. New violation introduced** | 3 legacy + `src/users/repo.ts:findUser` | Unchanged (3 items) | **FAIL (`new-finding`)** — `findUser` is not in the baseline. |
| **C. Trying to excuse the new violation** | 3 legacy + `findUser` | Added `findUser` (4 items) | **FAIL (`baseline-grew`)** — PR baseline contains an entry absent from `main`'s accepted baseline. |
| **D. Fixing debt without updating baseline** | 2 legacy (`searchLogs` fixed) | Unchanged (3 items) | **FAIL (`stale-allowance`)** — `searchLogs` is still in the baseline even though it is resolved. |
| **E. Fixing debt and shrinking baseline** | 2 legacy (`searchLogs` fixed) | Removed `searchLogs` (2 items) | **PASS** — accepted baseline shrinks to 2 items. If `searchLogs` ever regresses later, it is now a `new-finding` and blocks. |

#### 3. Graduation (Exit)
Once `export.ts` and `invoice.ts` are fixed and the baseline becomes `[]`, the ratchet is spent. The team deletes the baseline file and removes the ratchet filter, leaving `no-raw-sql` running as a standard preventive check.

---

## Response s09

In software engineering governance, a **ratchet** is an automated control mechanism that prevents a codebase metric or quality standard from getting worse while locking in every improvement made over time.

Like a mechanical ratchet that turns freely in one direction but clicks into place to block backward motion, a governance ratchet allows a metric to improve (or stay flat) and automatically tightens the threshold whenever progress is made.

---

### Purpose

Teams typically adopt ratchets when they want to enforce a higher engineering standard across a large or legacy codebase without halting feature delivery:

- **Stop the bleeding:** Immediately prevent new technical debt, policy violations, or quality regressions from entering the codebase.
- **Enable incremental improvement:** Avoid massive, risky "big bang" rewrites by letting the codebase converge toward the target standard organically as engineers touch files.
- **Make standards self-enforcing:** Shift compliance from manual code-review policing to automated CI gates.

---

### Behaviour

A ratchet follows a simple feedback loop integrated into version control and CI/CD:

1. **Establish a baseline:** Measure the current state of the codebase (e.g., 412 lint warnings, 68.4% test coverage, 95 untyped files) and store that baseline in the repository (e.g., in a config or snapshot file).
2. **Block regressions:** On every pull request, CI measures the metric against the stored baseline.
   - **Worse than baseline** (e.g., 413 warnings) → **CI fails**; the PR cannot merge.
   - **Same as baseline** (e.g., 412 warnings) → **CI passes**.
3. **Tighten on improvement:** When a PR improves the metric (e.g., reduces warnings from 412 to 405), the baseline is updated to `405`—either automatically by a bot/commit hook or by requiring the author to update the baseline file. `405` becomes the new ceiling.

Ratchets can be **numeric** (total count or percentage) or **file/instance-scoped** (a baseline list of specific legacy violations, ensuring *zero* new violations in new or touched code while legacy entries are only ever deleted).

---

### Limitations

While effective, ratchets have notable drawbacks if poorly designed:

- **Merge conflicts on the baseline:** A single shared baseline file (like a global warning count or snapshot) creates frequent merge conflicts in high-velocity repositories when multiple PRs improve the metric concurrently.
- **No guarantee of completion:** A ratchet prevents backsliding, not stagnation. If untouched legacy modules never get refactored, the codebase can sit indefinitely at a mediocre baseline.
- **Gaming and Goodhart's Law:** Engineers may optimize for the metric rather than real quality—for example, writing shallow tests to hit a coverage ratchet, or adding `// eslint-disable` suppressions to stay under a warning cap.
- **Metric volatility & false positives:** Metrics like code coverage or bundle size can fluctuate slightly due to deleting well-tested dead code or upgrading a compiler/linter, causing legitimate PRs to fail unfairly.
- **Bypass erosion:** If teams frequently override the ratchet for "urgent" changes without a mechanism to pay the debt back, the governance control loses credibility.
- **Wrong granularity:** A global numeric ratchet allows an engineer to introduce 5 new violations in one module as long as they fix 5 trivial ones elsewhere—masking localized decay.

---

### Practical Example: An ESLint Violation Ratchet

Suppose a team wants to adopt a strict ESLint rule (`@typescript-eslint/no-explicit-any`), but the codebase currently has **184 violations**. Enabling the rule as an error immediately would block all work; enabling it as a warning would be ignored.

#### 1. Store a baseline in the repo
Create a baseline file (e.g., `.lint-baseline.json`) tracking violations per file:

```json
{
  "src/billing/invoice.ts": 12,
  "src/legacy/parser.ts": 41
}
```

*(Using per-file counts or a tool like `betterer` / `eslint-nibble` avoids the global-count loophole where fixing one file lets you degrade another.)*

#### 2. Enforce in CI
Add a CI step that runs ESLint and compares each file's violation count against `.lint-baseline.json`:

- **New file with `any`:** Not in baseline (limit = `0`) → **Fails CI.**
- **PR adds an `any` to `invoice.ts` (12 → 13):** Exceeds baseline → **Fails CI.**
- **PR removes 3 `any`s from `invoice.ts` (12 → 9):** CI checks that `.lint-baseline.json` is updated to `9` (or fails with a prompt to run `npm run lint:ratchet -- --update`).
- **PR removes all `any`s from `invoice.ts` (12 → 0):** The entry is deleted from `.lint-baseline.json`. The file is now permanently governed by the strict rule.

#### 3. Outcome
Over a few quarters, normal feature work and boy-scout cleanups steadily shrink `.lint-baseline.json`. Once only a handful of legacy files remain, the team can spend a focused sprint clearing them, delete the ratchet script, and promote the ESLint rule to a standard global `error`.

---

## Response s10

In software engineering governance, a **ratchet** is an automated enforcement mechanism—usually running in CI/CD—that allows a quality metric or engineering standard to move in only one direction (improvement) while blocking any regression.

Like a mechanical ratchet that turns freely forward but locks against turning backward, a software ratchet lets teams incrementally raise standards on an existing codebase without needing a "big bang" rewrite.

---

### Purpose

* **Stop the bleeding on legacy codebases:** When a codebase already has 500 lint warnings, 40% test coverage, or hundreds of untyped files, enabling a strict rule globally would halt development. A ratchet lets you adopt the rule immediately by grandfathering existing violations while forbidding new ones.
* **Lock in incremental progress:** Whenever a developer cleans up legacy code or adds well-tested new code, the bar moves up permanently so the gain cannot be accidentally undone later.
* **Decouple governance from feature freezes:** Teams can pay down technical debt opportunistically alongside normal feature work rather than scheduling dedicated "debt sprints."

---

### Behaviour

A ratchet operates in a three-step loop on every pull request or commit:

1. **Record a baseline (the "watermark"):** The current state of a metric is stored in version control (e.g., a threshold value like `coverage: 68.4%`, a count like `maxWarnings: 214`, or a file-level ignore list).
2. **Block regressions:** CI measures the metric on the incoming change.
   * **Worse than baseline** → CI fails and blocks the merge.
   * **Equal to baseline** → CI passes.
3. **Tighten the threshold:** When a change **improves** the metric (e.g., warnings drop from 214 to 205), the baseline is updated to the new, stricter value—either automatically by a CI bot or by failing the build with a prompt to run an update script and commit the new baseline. Once merged, `205` becomes the new ceiling.

---

### Limitations

* **Gaming the metric (Goodhart's Law):** Strict enforcement can incentivize superficial compliance—writing low-value assertion-free tests to satisfy a coverage ratchet, or scattering `@ts-ignore` / `eslint-disable` comments to bypass a lint ratchet.
* **Perverse edge cases:** Percentage-based ratchets can punish good engineering. For example, deleting a large, well-tested legacy feature can *reduce* overall test coverage percentage and trigger a coverage ratchet failure, even though the codebase is cleaner.
* **Merge conflicts and friction:** Storing a single shared number or baseline file in Git creates frequent merge conflicts in high-velocity repositories.
* **Passive by itself:** A ratchet only *prevents backsliding* and *captures opportunistic gains*. If no one ever touches a legacy module, its debt remains indefinitely unless paired with active remediation goals.
* **Noisy or flaky signals:** Ratchets work poorly on non-deterministic metrics (e.g., benchmark latency, flaky test suites, or bundle sizes affected by upstream transitive dependencies), leading developers to distrust or bypass the check.

---

### Practical Example: An ESLint Warning Ratchet

Suppose a team wants to enable a strict ESLint rule (`@typescript-eslint/no-explicit-any`), but the repository currently has **142** existing violations.

**1. Store the baseline in version control (`.ratchet/lint-baseline.json`):**
```json
{
  "maxWarnings": 142
}
```

**2. Run a ratchet check in CI (`scripts/check-lint-ratchet.mjs`):**
```javascript
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const baselinePath = '.ratchet/lint-baseline.json';
const { maxWarnings } = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));

// Run ESLint with JSON output and count warnings
const output = execSync('npx eslint src --format json', { encoding: 'utf8' });
const results = JSON.parse(output);
const currentWarnings = results.reduce((sum, file) => sum + file.warningCount, 0);

if (currentWarnings > maxWarnings) {
  console.error(`❌ Lint ratchet failed: ${currentWarnings} warnings (baseline: ${maxWarnings}).`);
  console.error('Fix the new warnings before merging.');
  process.exit(1);
}

if (currentWarnings < maxWarnings) {
  console.error(`🎉 Warnings dropped from ${maxWarnings} to ${currentWarnings}!`);
  console.error(`Update ${baselinePath} to {"maxWarnings": ${currentWarnings}} to lock in this improvement.`);
  process.exit(1); // Or auto-update via a CI bot commit
}

console.log(`✅ Lint ratchet passed (${currentWarnings}/${maxWarnings} warnings).`);
```

**How it plays out in practice:**
* **PR A** introduces a new `any` type → count hits `143` → **CI fails**; the author must type it properly.
* **PR B** refactors a legacy module and removes 6 `any` types → count drops to `136` → **CI prompts** the author (or a bot commits) to lower `maxWarnings` to `136`.
* Over several months, the baseline ratchets down to `0`, at which point the team promotes the rule from `warn` to `error` and removes the ratchet script.

*(Note: Many mature ecosystems offer built-in or drop-in versions of this pattern—such as `betterer` for JS/TS, `rubocop --auto-gen-config` for Ruby, `phpstan --generate-baseline` for PHP, or per-file/per-directory ignore lists to reduce merge conflicts.)*

