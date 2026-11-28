# C179 change

## PLAN

1. Record the intent I37, the Requirements F234 and F235 and the Cases T1737 and T1738 (plain `.test.mjs`).
   - T1737 runs `runControl` with checks that throw: a typed platform failure of each kind (`rate-limited`, `forbidden`, `not-found`, `network`, `other`) gives UNKNOWN with `cause` equal to that failure, unchanged; a plain `Error` gives `cause` `{ kind: 'check-error', message }`; a failure of an unknown kind or with no `asked` or `place` is a `check-error` that names what was malformed; a check that answers has no `cause`. Mode, `blocked`, `confirmed` and the record behave as before. RED on `main`: `cause` is absent.
   - T1738 requires `scripts/lib/guide-cause.mjs`, pure, with `guideCause(cause)` returning one line by kind (the bucket and reset time for a rate limit; the place and what was asked for the others; the platform's own message verbatim and quoted; the check's own message for a `check-error`), `null` for no cause, and `runControl`'s `guidance` equal to it. RED on `main`: the file is absent.
   - Both were run GREEN against a throwaway copy that is not committed (about 40 lines). Without it the suite is the existing Cases GREEN and these two RED.
2. No script, flag, workflow or Skill change in the PLAN.

## DO

Not authorized by this PLAN. On its merge into the collector `kaal/controls/cause-in-verdict`:

1. `scripts/lib/guide-cause.mjs`: `guideCause(cause)` as F235 says, imported by the adapter.
2. `scripts/adapter.mjs` `runControl`: keep the error a check throws as `cause` and add `guidance` to the result and `cause` (kind, asked, place) to the log line, as F234 says. Every verdict that carries a `cause` is UNKNOWN; nothing about modes or blocking changes.
3. `references/` and SKILL.md: one short paragraph, in the words of the package (no KAAL terms): a check that cannot read what it needs throws the typed failure of its fact source, so its UNKNOWN names the cause.
4. T1737 and T1738 GREEN; the whole package suite GREEN. Mutations, each caught: the error swallowed again; a platform kind remapped to PASS or FAIL; the platform message rewritten; a malformed failure passed through as typed; guidance dropped from the result.
5. ACT: a retro entry in the collector.

## The shape, agreed with Hosting

Hosting plans one typed failure for every platform read and operation: `PlatformFailure = { kind: 'rate-limited' | 'forbidden' | 'not-found' | 'network' | 'other', asked, place, status?, platformMessage?, limit?: { bucket, remaining?, resetAt?, retryAfterSeconds? } }`, from `classifyPlatformFailure(answer, { asked, place })` in `@kaihacksai/kaal-hosting`. It is planned, not delivered. Controls defines no copy: it checks only that `kind` is one of the five and that `asked` and `place` are text, and passes the object through unchanged. The fact source (Hosting's adapter or the check's own reader) classifies and throws it as `error.failure`; Controls never calls the classifier and never reads a platform answer.

## Design questions, with the recommendation taken unless the Owner says otherwise

1. **Which verdict a cause gives.** UNKNOWN for every kind, never FAIL, PASS or CONFIG_FAILED: a rate limit means the control could not judge. Under a blocking mode UNKNOWN blocks as it does today; the difference is that the log and the result say why.
2. **Untyped errors.** A check that throws a plain error is a bug or an unmapped failure; its own message is the cause (`check-error`), so nothing is swallowed either way.
3. **Order with C163.** The DO edits `runControl` where it is on `main` (`scripts/adapter.mjs`); C163 moves it to `lib/run-control.mjs`. Whichever lands second carries the other's lines in its sync. C179 does not depend on Hosting's delivery: the Cases use hand-made failures of that shape.
4. **Where it is shown.** The result and the log line carry it. How the guard report prints it, and a flag or ratchet for "an UNKNOWN with no cause is a finding", are later and Guard's to decide.

## Not here

No WIRE, flag, station, required check, ruleset, npm publish or change of `private`. No change to what a check or a record means.
