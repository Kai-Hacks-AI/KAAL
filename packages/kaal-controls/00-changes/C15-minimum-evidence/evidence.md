# C15 evidence

## Observed RED against `main`

`main` at 753bc3c. Each Case is called through its `run()` and fails on its own assertion:

```
RED controls/T1086 a valid evidence list fails validation
RED controls/T1087 the evidence script is absent
RED controls/T1088 the evidence script is absent
RED controls/T1089 a tested claim with no minimum passed given records
RED controls/T1090 declaring-controls.md does not say :fail
```

## Can each Case pass

Against a throwaway copy of the package outside the repository, with the finder line, `evidence.mjs`, `--records` and the two reference texts added, all five Cases were GREEN and the 42 existing Cases of the package stayed green, with `SKILL.md` at 599 words. The throwaway diff is kept for the DO at `/mnt/project-files/controls/c15/C15-throwaway.diff`.

## What this shows and does not show

The Cases show that a minimum can be declared as a set of kinds of X with runs and one real failure, that missing, short, repeated, not GREEN or foreign evidence is UNKNOWN and never a pass, and that, given records, the check fails a `tested` claim that is not shown. They do not show that any control meets its minimum: no KAAL control declares one, no records exist and no runner is connected to them.

## Reproduce

```
for f in $(find packages/kaal-controls -name 'T10[89]*.red.mjs' | sort -V); do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
