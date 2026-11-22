# C21 evidence

## Observed RED against `main`

Each Case is a plain `.test.mjs`, never renamed, called through its `run()` and fails on its own assertion:

```
RED controls/T1108 scripts/judge-mode.mjs is absent
RED controls/T1109 scripts/judge-mode.mjs is absent
RED controls/T1110 advisory was refused
RED controls/T1111 the package has no AGENTS.md
RED controls/T1112 scripts/judge-mode.mjs is absent
RED controls/T1113 scripts/judge-mode.mjs is absent
```

T1108, T1109, T1112 and T1113 are blocked at the first assertion because the script does not exist, before any behavioural assertion; T1110 and T1111 fail on a behaviour of `main`.

## Can each Case pass

Against a throwaway copy of the package outside the repository, with `scripts/judge-mode.mjs`, the three modes and the `exit` rule in `find-controls.mjs`, and a short `AGENTS.md` shipped by `files`, all six Cases were GREEN. Of the 48 existing Cases, 47 stayed green and one failed: controls/T591 asserts that `files` is exactly `['skills']`. The DO makes that assertion `['skills', 'AGENTS.md']` and the change is named in `change.md`.

## What this shows and does not show

The Cases show that each mode treats the same answer as it says, that a ratchet blocks only what is new, only shrinks, advances as findings are resolved, fails growth and a stale allowance, treats a returned finding as new, is unknown without a usable reference, and is spent when its baseline is empty, that the finder accepts the three modes and requires a ratchet to state its exit, and that the package ships an instructions file that names a Skill that exists. They do not show that the Skill's wording makes an agent claim no more than the mode, or that the instructions file gets an agent to read the Skill: those are judged by the agent trial in `verification.md`, run in the DO, and nothing here shows them.

## Reproduce

```
for n in 1108 1109 1110 1111 1112 1113; do
  f=$(find packages/kaal-controls -name "T$n.test.mjs")
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```

## Preview of the sensitivity (not the CHECK)

To know before the DO that each weakening has a witness, four weakenings were loaded one at a time on the throwaway copy. Each was noticed by the Case named; this is a preview, and the CHECK repeats it on the DO's own script.

| Claim | Weakening loaded | Witness | Assertion that failed |
| --- | --- | --- | --- |
| a new finding blocks | the verdict is always PASS | T1109 | a new finding did not block |
| a baseline only shrinks | growth is never detected | T1112 | a baseline that grew was accepted |
| a resolved allowance is removed | the next baseline keeps what was resolved (and a stale allowance is ignored) | T1109, T1112 | the next baseline was not the reference without what was resolved; an allowance kept for a resolved finding was accepted |
| missing evidence is not success | a missing reference is treated as empty | T1113 | a missing reference passed |
