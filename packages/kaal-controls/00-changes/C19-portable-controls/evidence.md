# C19 evidence

## Observed RED against `main`

Each Case is called through its `run()` and fails on its own assertion:

```
RED controls/T1102 a linked Intent was not reported as linked
RED controls/T1103 a control with stations of its own names was refused
RED controls/T1104 a handed-in link did not replace the first line, or a link to another control counted
RED controls/T1105 the line does not start with id, title and type
```

## Can each Case pass

Against a throwaway copy of the package outside the repository, with the stated Intent form, the shape check of a station, `links` and the title and type in `stateLine` added, all four Cases were GREEN and 49 of the 50 existing Cases stayed green. The one that failed is T920 of controls/F25, which names `[Nowhere:preventive]` as an invalid station; under this Change that name is a station, and the DO adapts that Case and keeps its other refused shapes.

## What this shows and does not show

The Cases show that a control may name its Intent as objects or in words and the finder says which, that a station is any name of the right shape and the registry lists a control at it, that handed-in Case links are the only source of a control's Cases and the first line is read only when none are handed in, and that a control's report line starts with its id, title and type. They do not show the discovery guidance or the seeks: those are judged by an agent trial in the DO, not by a Case, and nothing here shows an agent finds a consumer's controls better with them.

## Reproduce

```
for n in 1102 1103 1104 1105; do
  f=$(find packages/kaal-controls -name "T$n.red.mjs")
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
