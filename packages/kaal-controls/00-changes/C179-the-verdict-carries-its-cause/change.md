# C179 change

## PLAN

1. Record the intent I37, the Requirements F234, F235 and F236 and the Cases T1737, T1738 and T1739 (plain `.test.mjs`).
   - T1737 runs `runControl` with checks that throw: a typed platform failure of each kind (`rate-limited`, `forbidden`, `not-found`, `network`, `setting`, `other`) gives UNKNOWN with `cause` equal to that failure's safe shape (the same object when it holds only safe fields); a plain `Error` gives `cause` `{ kind: 'check-error', message }`; a failure of an unknown kind or with no `asked` or `place` is a `check-error` that names what was malformed; a check that answers, with findings or none, has no `cause` and keeps its FAIL, REPORT or PASS. Mode, `blocked`, `confirmed` and the record behave as before. RED on `main`: `cause` is absent.
   - T1738 requires `scripts/lib/guide-cause.mjs`, pure, with `guideCause(cause)` returning one line by kind (the bucket and reset time for a rate limit; the place and what was asked for the others; the platform's own message verbatim and quoted; the check's own message for a `check-error`), `null` for no cause, and `runControl`'s `guidance` equal to it. RED on `main`: the file is absent.
   - T1739 requires an explicit safe output shape (F236): unexpected properties of the failure at any depth (`headers`, `token`, `url`, `body`, `authorization`, extra fields inside `limit`) are never emitted; a field of the wrong type is dropped; and for each of six credential shapes (GitHub tokens of each prefix, a fine-grained token, a `Bearer` value, an `Authorization` value, a URL secret) in `asked`, `place`, `platformMessage`, a plain error message or `limit.bucket`, the verdict's `cause`, `guidance` and log line hold `[redacted]` instead. A failure with only safe fields and no credential is unchanged. RED on `main`: `safeCause` is absent.
   - All three were run GREEN against a throwaway copy that is not committed (about 60 lines). Without it the suite is the existing Cases GREEN and these three RED.
2. No script, flag, workflow or Skill change in the PLAN.

## DO

Not authorized by this PLAN. On its merge into the collector `kaal/controls/cause-in-verdict`:

1. `scripts/lib/guide-cause.mjs`: `guideCause(cause)` as F235 says, imported by the adapter.
2. `scripts/adapter.mjs` `runControl`: keep the error a check throws as `cause` and add `guidance` to the result and `cause` (kind, asked, place) to the log line, as F234 says. Every verdict that carries a `cause` is UNKNOWN; nothing about modes or blocking changes.
3. `safeCause` in the same file: the cause is rebuilt from the allowlist and redacted before it is carried (F236). Headers, bodies, tokens and queries have no field in it.
4. `references/` and SKILL.md: one short paragraph, in the words of the package (no KAAL terms): a check that cannot read what it needs throws the typed failure of its fact source, so its UNKNOWN names the cause.
5. T1737, T1738 and T1739 GREEN; the whole package suite GREEN. Mutations, each caught: the error swallowed again; a platform kind remapped to PASS or FAIL; the platform message rewritten; a malformed failure passed through as typed; a property passed through that the allowlist does not name, at the top level or inside `limit`; a credential left in the platform message, in `limit.bucket`, in a plain error message or in the log line; guidance dropped from the result.
6. ACT: a retro entry in the collector.

## The shape, agreed with Hosting

Hosting plans one typed failure for every platform read and operation: `PlatformFailure = { kind: 'rate-limited' | 'forbidden' | 'not-found' | 'network' | 'setting' | 'other', basis: 'answer' | 'text' | 'budget', asked, place, status?, platformMessage?, ambiguous?: true (only with `other`), limit?: { bucket, remaining?, resetAt?, retryAfterSeconds? } }`, from `classifyPlatformFailure(answer, { asked, place })` in `@kaihacksai/kaal-hosting`. It is planned, not delivered; the DO is aligned with Hosting's final contract (the CPO's condition) before it starts, and the Cases follow any rename of a field. Controls defines no copy: it checks only that `kind` is one of the six and that `asked` and `place` are text, and passes the object through unchanged. The fact source (Hosting's adapter or the check's own reader) classifies and throws it as `error.failure`; Controls never calls the classifier and never reads a platform answer.

## Telling a rate limit, a setting and a real finding apart (Owner direction)

A third-party check such as Dependency Review can say "not supported on this repository" when the real cause was the API limit. Hosting classifies (from the answer, the text, or the budget seen) and Controls carries: `setting` for a platform feature that is off, `other` with `ambiguous` when the text claims a setting but no budget reading backs it (the guidance says it may be a rate limit and to re-run once, then report), `rate-limited` when the budget was exhausted. A real finding of a third-party check is the check's verdict, never a failure: it is FAIL or REPORT, with no cause. So the message to agents and humans names which of the three it is.

## Design questions, with the recommendation taken unless the Owner says otherwise

1. **Which verdict a cause gives.** UNKNOWN for every kind, never FAIL, PASS or CONFIG_FAILED: a rate limit means the control could not judge. Under a blocking mode UNKNOWN blocks as it does today; the difference is that the log and the result say why.
2. **Untyped errors.** A check that throws a plain error is a bug or an unmapped failure; its own message is the cause (`check-error`), so nothing is swallowed either way.
3. **Order with C163.** The DO edits `runControl` where it is on `main` (`scripts/adapter.mjs`); C163 moves it to `lib/run-control.mjs`. Whichever lands second carries the other's lines in its sync. C179 does not depend on Hosting's delivery: the Cases use hand-made failures of that shape.
4. **Where it is shown.** The result and the log line carry it. How the guard report prints it, and a flag or ratchet for "an UNKNOWN with no cause is a finding", are later and Guard's to decide.

## Not here

No WIRE, flag, station, required check, ruleset, npm publish or change of `private`. No change to what a check or a record means.

## DO (done)

- `scripts/lib/guide-cause.mjs` (`isFailure`, `safeCause`, `guideCause`) and the `runControl` edit in `scripts/adapter.mjs`, as the PLAN says. The shape is the one Hosting stated for `PlatformFailure` and is kept behind the allowlist, so a change on Hosting's side shows as an unknown field that is dropped and not as a leaked one. Hosting's PLAN is not up yet; if it differs, the allowlist and T1737 to T1739 follow it.
- Evidence: on the base (the PLAN alone) T1737, T1738 and T1739 RED, the rest 130 GREEN. With the DO the package lane is 133 GREEN, 0 RED, held 0, findings 0; the three register entries are removed in this change.
- Mutations, each caught: redaction removed (all three Cases RED); `ambiguous` allowed on any kind (T1739); text no longer cleaned (T1739); any value accepted as a failure (T1737); the check-error guide removed (T1738).
