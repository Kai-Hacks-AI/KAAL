# C20 evidence

## Observed RED against `main`

Each Case is called through its `run()` and fails on its own assertion:

```
RED controls/T1106 an unexplained RED run did not block
RED controls/T1107 a record with no recorder counted
```

## Can each Case pass

Against a throwaway copy of the package outside the repository, with `by`, `handled`, `unrecorded`, `unhandled`, `handledRuns` and the reason `unhandled` added to `evidence.mjs` and the count in the state line, both Cases were GREEN. Of the existing Cases, T1087, T1088, T1089, T1091 and T1092 failed, because they build records with no `by`. With a `by` added to their records, 49 of 50 were green; the one left is T1088, which asserts that an unexplained RED run beside the minimum is still `PASS`. That is the behaviour this Change reverses on purpose, and the DO changes that assertion (see `change.md`).

## What this shows and does not show

The Cases show that a RED or UNKNOWN run with no explanation keeps a tested claim unproven however many GREEN runs there are, that an explained run neither blocks nor counts as a GREEN run, and that a record with no recorder is not counted and is listed. They do not show that an explanation is true or that the recorder is not the author: the first is for a review, the second a rule in the Skill.

## Reproduce

```
for n in 1106 1107; do
  f=$(find packages/kaal-controls -name "T$n.red.mjs")
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
