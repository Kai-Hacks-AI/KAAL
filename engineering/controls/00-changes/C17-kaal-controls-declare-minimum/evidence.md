# C17 evidence

## Observed RED against `main`

`main` at 4479d00. Each Case is called through its `run()` and fails on its own assertion:

```
RED controls/T1094 controls without a declared minimum: release/CTL1, release/CTL10, release/CTL11, release/CTL19, release/CTL2, release/CTL20, release/CTL5, release/CTL7, release/CTL8, release/CTL9
RED controls/T1095 no control declares a minimum
RED controls/T1096 engineering/controls/06-records does not exist
```

## Can each Case pass

Against a throwaway worktree of `main`, with the ten lines of `interface.md` added and `06-records/README.md` present, all three Cases were GREEN. A first try gave a corrective control one real run and T1095 went RED on it, so the table now asks two of a corrective control as well as of a preventive one.

The same throwaway shows what the DO must repair: ten release Cases (T540, T600, T730, T750, T751, T752, T860, T880, T1116, T1129) went RED because they compare each control file with its draft (six strip `status`, four compare the whole file). The engineering Cases went from 16 failures on `main` to 26 with the lines added. With one `.replace(/^evidence: .*\n/m, '')` added to each of the ten Cases the same 16 fail and no other, and the 16 are the names that fail on `main`.

## What this shows and does not show

The Cases show that every registered control can declare a minimum of the shape controls/F30 asks for, that the records have a place the controls package can read, and that a `tested` claim is judged against them. They do not show any control's progress: no run is recorded.

## Reproduce

```
for f in $(find engineering/controls -name 'T109[4-6].red.mjs' | sort -V); do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
