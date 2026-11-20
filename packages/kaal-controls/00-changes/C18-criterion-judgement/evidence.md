# C18 evidence

## Observed RED against `main`

Each Case is called through its `run()` and fails on its own assertion:

```
RED controls/T1098 a base without a Case counted
RED controls/T1099 readSubjects is not exported
RED controls/T1100 reviewsOf is not exported
RED controls/T1101 a refusal at another station counted
```

## Can each Case pass

Against a throwaway copy of the package outside the repository, with the `without` and `shows` rules, `readSubjects` and `reviewsOf` added to `evidence.mjs`, all four Cases were GREEN and the 47 existing Cases stayed green.

## What this shows and does not show

The Cases show that a provoked run counts as its type requires, that an unnamed mechanism and an unshown run are said, that the reviews of a control are found by its id and not by another focus or subject, and that each says whether it read every Intent and Case of the control, without changing a verdict. They do not show that any real control's Cases cover its criterion: that is what a review is for, and none has been made.

## Reproduce

```
for n in 1098 1099 1100 1101; do
  f=$(find packages/kaal-controls -name "T$n.red.mjs")
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
