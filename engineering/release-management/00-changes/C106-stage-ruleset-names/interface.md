# C106 interface

## Draft of F82.md

`````
---
id: release/F82
title: stage-ruleset-names
kind: functional
serves: [release/I27]
---
# release/F82 stage-ruleset-names

Each stage that has a ruleset declares its name in `stages.json` (`ruleset`): `20 - integrating`, `21 - hotfixing`, `22 - wiring`, `23 - collecting`, `30 - promoting` and `40 - publishing`. The number is the stage's place in the flow (00 all, 10 development, 2x integrating, 30 promoting, 40 publishing). `verify Stages` judges each source's `name` against its stage's declared name and holds no name in code. A stage that declares no name, or one that is not a string, fails closed.
`````

## The declaration

`stages.json` gains `"ruleset": "<name>"` on: Integrating `20 - integrating`; its parts Hotfixing `21 - hotfixing`, Wiring `22 - wiring`, Collecting `23 - collecting`; Promoting `30 - promoting`; Publishing `40 - publishing`. Developing has no ruleset.

## The judge

```
const declaredName = (name) => (name === "Integrating" ? integrating : name === "Promoting" ? promoting : integrating.parts.find((p) => p.name === name))?.ruleset;
...
const named = declaredName(name);
if (typeof named !== "string" || !named) add(name, `${name}: the stage declares no ruleset name`);
else if (r.name !== named) add(name, `${name}: the ruleset is named ${r.name}, not ${named}`);
...
if (typeof publishing.ruleset !== "string" || !publishing.ruleset) pub("the stage declares no ruleset name");
else if (p.name !== publishing.ruleset) pub(`the ruleset is named ${p.name}, not ${publishing.ruleset}`);
```

## The sources

The `name` of `integrating.json`, `hotfixing.json`, `wiring.json`, `collecting.json`, `promoting.json` and `publishing.json` becomes the declared name of its stage. Nothing else in a source changes.
