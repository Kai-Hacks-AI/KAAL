# C4 evidence

## Observed RED against `main`

`main` at `993d9f0`. Each Case is called through its `run()` and fails on its own assertion:

```
RED retro/T1250 find-retros.mjs is absent
RED retro/T1251 judge-retro.mjs is absent
RED retro/T1252 judge-retro.mjs is absent
RED retro/T1253 judge-retro.mjs is absent
RED retro/T1254 the scripts folder is absent
```

## Can each Case pass

Against a throwaway copy outside the repository holding only a finder and a judgement of about 60 lines each, all five Cases were GREEN. The throwaway is not kept: it is a sketch of the DO, not its source.

## What this shows and does not show

The Cases show that a retro file can be found and refused with reasons, that the form of the four lenses is judged by rule (fields per lens, an address only on Lacked, one subject in one entry, a Learned never empty), that the judgement stays form only and says `unjudged` for a format it does not know, and that the scripts need nothing outside Node. They do not show that the lenses are the right ones to an agent, that an agent finds the Skill, or that a retro it writes is true: F4 and the truth of an entry are left to the DO's agent trial and to the owner of what a retro addresses.

## Reproduce

```
for f in $(find packages/kaal-retro -name 'T125*.red.mjs' | sort -V); do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
