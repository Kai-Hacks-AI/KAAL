# C16 evidence

## Observed RED against `main`

Each Case is called through its `run()` and fails on its own assertion:

```
RED controls/T1091 computedState is not exported
RED controls/T1092 stateLine is not exported
RED controls/T1093 the command did not show one line per control with a minimum
```

## Can each Case pass

Against a throwaway copy of the package outside the repository, with `computedState`, `stateLine` and the changed command added to `evidence.mjs`, all three Cases were GREEN and the 47 existing Cases stayed green, with `SKILL.md` at 599 words.

## What this shows and does not show

The Cases show that the computed state is `tested` only when the minimum is shown, that one line carries the claim, the state and the progress per kind of X, and that every control declaring a minimum gets a line whatever its claim while only an unshown `tested` claim fails. They do not show any KAAL control's progress: none declares a minimum and no records exist.

## Reproduce

```
for f in $(find packages/kaal-controls -name 'T109[1-3].red.mjs' | sort -V); do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
