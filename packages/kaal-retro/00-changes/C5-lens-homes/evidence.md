# C5 evidence

## Observed RED against the collector

`kaal/retro/agent-seat-4l` at the merge of the C4 PLAN (#2152). The collector does not yet hold the C4 DO, so the Case is RED because the judgement is absent:

```
RED retro/T1255 judge-retro.mjs is absent
```

## Can the Case pass

Against a throwaway copy outside the repository of the judgement from the C4 DO (#2156) with one added rule, that the first line after the front matter begins `Account of:` followed by text, T1255 was GREEN. The throwaway is not kept.

## What this shows and does not show

T1255 shows that any wording passes, that an absent, empty, blank, not-first or after-the-lenses line is `malformed` with the rule `account-of`, and nothing about what the line says. The existing Cases T1250 to T1254 carry a fixture without the line, so they pass only after the DO adds it. F5 has no Case; it is judged by the DO's agent trial.

## Reproduce

```
node -e "import('./packages/kaal-retro/02-requirements/F6-identity-line/T1255.red.mjs').then(async m=>{try{await m.run();console.log('GREEN')}catch(x){console.log(x.code==='ERR_ASSERTION'?'RED-observed':'ERROR',String(x.message).split('\\n')[0])}})"
```
