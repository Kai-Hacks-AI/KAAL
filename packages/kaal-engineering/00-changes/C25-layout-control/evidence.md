# C25 evidence

The PLAN of C25 observes its RED against the collector `kaal/engineering/setup` at `ced6598a`. It cites nothing that is not on that collector.

## Provenance

- Method: each Case's `run()` is called in the tree of this PLAN. No job executes them yet. Observed 19 Nov 2026, Node 22 on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| T1230 | I4 | RED: the check is absent |
| T1231 | F52 | RED: the check is absent |
| T1232 | F52 | RED: the check is absent |
| T1233 | F52 | RED: the check is absent |
| T1234 | F53 | RED: the check is absent |
| T1235 | N21 | RED: the check is absent |
| T1236 | A4 | RED: the check is absent |
| T1237 | CTL2 | RED: CTL2.md is absent |

8 RED-observed, 0 error, 0 green. Every Case fails on its own assertion.

## Can each Case pass

In a throwaway root outside the repository, holding the package with `draft/` copied over `skills/kaal-engineering/` and the control from `interface.md` at `engineering/02-controls/CTL2-verify-layout/`, all eight Cases were green, and the Engineer Skill's `check-skill` exited 0 on the Skill with the script. The controls finder lists `engineering/CTL2` as detective with Intent I4, and the controls checker accepts its evidence declaration.

## Can a Case fail for the right reason

Four edits to the check on that copy: dropping the `dist` rule turned T1234 RED, dropping the verifying-folder rule turned T1232 RED, letting an empty folder through turned T1235 RED, and dropping the numbered-folder rule turned T1231 RED.

## A real run, the baseline

The check over the 12 capability folders of `packages/`, observed once by hand (it is not part of the controls' minimum yet): all 12 are FAIL. Ten use the earlier numbering (`00-changes`, `01-intent` and so on) and two (`kaal-testing`, `kaal-core`) hold none of the layout's folders. `kaal-engineering` itself is among the FAILs, since it uses the earlier numbering too. That is the baseline the ratchet starts from; nothing fails a pull request.

## What this shows and does not show

The Cases show that the check tells a correct setup from a bad one on fixtures and that it says UNKNOWN when it cannot judge. They do not show that the template is the right layout (C24's judgment), nor that every capability should reach PASS before a migration plan exists.

## Reproduce

```
for f in $(find packages/kaal-engineering -name 'T123*.red.mjs' | sort -V); do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```
