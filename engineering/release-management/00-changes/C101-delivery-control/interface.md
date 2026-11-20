# C101 interface

Drafts as they are added in the DO. The element Cases read the drafts here; the behaviour Cases read the real files once the DO has changed them.

## Draft of F78.md

`````
---
id: release/F78
title: delivery-rule-checks
kind: functional
serves: [release/I53]
---
# release/F78 delivery-rule-checks

The rule that delivery travels apart from solution (release/F73) checks in every shape its checker runs in: in the repository, and as the lone copy that the wrapper scripts run from a temporary directory. A wrapper gives the checker the delivery reader and the declaration it reads, taken verbatim from the target's tip, beside the checker. When the reader or the declaration is missing, or the declaration is malformed, the rule says `cannot check`; that is UNKNOWN, it never counts as a pass of the rule, and the gate itself is not affected. The rule stays detective and gates nothing.
`````

## Draft of A69.md

`````
---
id: release/A69
title: delivery-reader-beside-checker
addresses: [release/F78]
---
# release/A69 delivery-reader-beside-checker

The checker `engineering/change-isolation/check.mjs` looks for the delivery reader first where the repository holds it (`../release-management/05-src/delivery/locations.mjs`) and then beside itself (`./kaal-delivery-locations.mjs`, with the declaration `./kaal-delivery-locations.json` handed to the reader's `readLocations`). The two wrapper scripts, `engineering/github/change-isolation.sh` (the Change Isolation job) and `engineering/github/push-check.sh` (the pre-push check), write those two files next to the temporary copy of the checker from the target's tip with `git show` (the way `change-isolation.sh` already writes Foundation's SHA-256), and remove a file the target does not hold. Nothing else of the checker or the gate changes.
`````

## Draft of CTL23.md

`````
---
id: release/CTL23
title: verify Delivery
description: It reveals whether a change mixes delivery paths with solution paths.
type: detective
status: designed
has: [release/I53]
evidence: [fixture:2, real:1, provoked:1:fail]
---
# release/CTL23 verify Delivery

A detective control. `verify Delivery` reads the paths of a change and the delivery declaration (release/A67) and says whether a change that touches a delivery location, a declared root or a declared root file, carries a path that is not delivery. PASS: no delivery location is touched, or every path is delivery. FAIL: a delivery path together with a solution path. UNKNOWN: the declaration or the reader cannot be read; that never counts as a pass.

It reveals; it gates nothing. It runs inside Change Isolation, after that gate's own result, and prints one line per path that is not delivery. Making it preventive is a different control with the same check, made only after this one is Tested and the Owner decides. Core's own special rule is retired and not part of it.

It declares its own minimum evidence in the kinds controls/F30 asks of every control: two runs against a fixture (the wrapper on a scratch repository), one real run of Change Isolation on a pull request into `main` whose log shows a checked line, and one provoked failure (a mixed change made on purpose, RED on a `main` without the reachable reader and GREEN with it).

It has one Intent, release/I53.
`````

## Edit of engineering/change-isolation/check.mjs

The reader lookup and the default of `deliveryMixed` (the rest of the file is unchanged; `fileURLToPath` is already imported). The line `...` stands for the unchanged code between the two hunks.

`````diff
-const delivery = await import("../release-management/05-src/delivery/locations.mjs").catch(() => null);
+let delivery = null, declaration;
+for (const [reader, json] of [["../release-management/05-src/delivery/locations.mjs", undefined], ["./kaal-delivery-locations.mjs", "./kaal-delivery-locations.json"]]) {
+  try { delivery = await import(reader); declaration = json && fileURLToPath(new URL(json, import.meta.url)); break; } catch { /* try the next */ }
+}
...
-export function deliveryMixed(paths, { read = delivery?.readLocations } = {}) {
+export function deliveryMixed(paths, { read = delivery && (() => delivery.readLocations(declaration)) } = {}) {
`````

## Edit of engineering/github/change-isolation.sh

After Foundation's SHA-256 lines.

`````diff
 git show "$BASE:packages/kaal-foundation/05-src/skills/kaal-foundation/scripts/sha256.mjs" > "$T/kaal-foundation-sha256.mjs" 2>/dev/null \
   || git show "$BASE:packages/kaal-foundation/lib/sha256.mjs" > "$T/kaal-foundation-sha256.mjs" 2>/dev/null \
   || rm -f "$T/kaal-foundation-sha256.mjs"
+# The delivery reader and the declaration it reads (release/A67), verbatim from the target's tip, beside the checker. A target without them
+# can still check every other rule; the detective delivery rule then says it cannot check.
+git show "$BASE:engineering/release-management/05-src/delivery/locations.mjs" > "$T/kaal-delivery-locations.mjs" 2>/dev/null || rm -f "$T/kaal-delivery-locations.mjs"
+git show "$BASE:engineering/release-management/03-architecture/A67-delivery-locations/delivery-locations.json" > "$T/kaal-delivery-locations.json" 2>/dev/null || rm -f "$T/kaal-delivery-locations.json"
`````

## Edit of engineering/github/push-check.sh

After the line that writes `$tmp/check.mjs` and before the result that uses it; the exact place is chosen in the DO, in the same style as the SHA-256 lines of `change-isolation.sh`.

`````diff
 if ! git show "$base:engineering/change-isolation/check.mjs" >"$tmp/check.mjs" 2>/dev/null; then
   fail "Change Isolation: not verified: $target does not hold engineering/change-isolation/check.mjs"
...
+# beside the checker, from the target's tip: the delivery reader and its declaration (release/A69)
+git show "$base:engineering/release-management/05-src/delivery/locations.mjs" >"$tmp/kaal-delivery-locations.mjs" 2>/dev/null || rm -f "$tmp/kaal-delivery-locations.mjs"
+git show "$base:engineering/release-management/03-architecture/A67-delivery-locations/delivery-locations.json" >"$tmp/kaal-delivery-locations.json" 2>/dev/null || rm -f "$tmp/kaal-delivery-locations.json"
`````
