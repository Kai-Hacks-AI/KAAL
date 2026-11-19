# C13 evidence

The PLAN of C13 observes its RED against `main` at `733d84b9fb0e57f1748475dd0d613dccbf28a306`, where C12 is already promoted.

## Provenance

- Method: each Case's `run()` is called in the tree of this PLAN. No job executes them yet. Observed 17 Nov 2026, Node on Linux.

## Result

| Case | Tests | In the tree of this PLAN |
| --- | --- | --- |
| T780 | controls/CTL1 | RED: `controls/CTL1` is not listed |
| T781 | controls/I7 | RED: no control has `controls/I7` |
| T782 | controls/CTL1 | RED: the declaration is absent |
| T783 | controls/G90 | RED: `controls/CTL1` is absent |

4 RED-observed, 0 error, 0 green. Every Case fails on its own assertion.

## Can each Case pass

Against a throwaway copy with the draft copied to `04-controls/CTL1-check-controls/CTL1.md`, all four Cases were green.

## What this shows and does not show

The Cases show that the control is declared, valid and found from its Intent, and that the check reveals an incomplete declaration of this very control. They do not show that the control protects anything: no ruleset requires the Engineering check through this Change.

## Reproduce

```
for f in $(find engineering/controls -name 'T78*.red.mjs' | sort -V); do
  node -e "import('./$f').then(async m=>{try{await m.run();console.log('GREEN',m.id)}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',m.id,String(x.message).split('\n')[0])}})"
done
```

## DO: the Engineering check running on a pull request

Ground for `status: running`. The Engineering check of pull request #2001 (this DO, head 88f7a10), job https://github.com/Kai-Hacks-AI/KAAL/actions/runs/44470913630/job/135379869293, ended in success: 550 tests, 550 pass, 0 fail. Its log lists the controls Cases, among them:

```
✔ controls/T778 (controls/F23): Engineering runs the product check on the controls that exist in its folders at execution time
✔ controls/T780 (controls/CTL1): the finder lists controls/CTL1 as a valid detective control that has controls/I7 and is running, equal to its draft
✔ controls/T781 (controls/I7): controls/I7 is answered by a control: controls/CTL1 has it, and the control tests answer for it
✔ controls/T782 (controls/CTL1): the check passes the declaration of controls/CTL1 and reveals it when its status or its Intent is taken away
✔ controls/T783 (controls/G90): gap controls/G90 is closed: controls/CTL1 is declared and found
```

This shows the check runs on a pull request and judges the declaration of CTL1 itself. It does not show that the check blocks anything: no ruleset requires the Engineering check through this Change, and the Cases do not cover a failing run on a pull request.
