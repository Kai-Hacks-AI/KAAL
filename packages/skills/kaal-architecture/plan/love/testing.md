# Packaging Readiness (LOVE): Testing

The planned outer tests will live in `packages/skills/kaal-architecture/test/plan/love.test.mjs`, written in `architecture/C4` and turned GREEN by `architecture/C5`. Each title names the contracts it checks. They are immutable to DO and CHECK. Core's conformance Test Cases are Core's: Engineering runs them against `contract.json`, and Architecture does not copy them. What RED and GREEN mean, and what counts as evidence, is Testing's.

| Test | Checks | Loop |
| --- | --- | --- |
| architecture/T1: `contract.json` names Core's `Installation Contract` as its format, the Capability `architecture`, the package's version, one `directory` asset from `skills/kaal-architecture` to `.agents/skills/kaal-architecture` without `surface`, the record `.kaal/state/architecture/installation.json`, Node 24, and `provides` the Skill `kaal-architecture` | architecture/F1, architecture/N2 | Requirements |
| architecture/T2: the catalogue holds the SHA-256 of the current bytes of every file under the Skill's target, and the contract's version equals `package.json`'s | architecture/F2 | Requirements |
| architecture/T3: Core's `realizeIn`, given the Agent Skill and `contract.json`, in an empty repository with no providers declared, places the Skill only at `.agents/skills/kaal-architecture/` and registers it in `.kaal/state/architecture/installation.json`; Core's `renderSkill` accepts the Agent Skill, and the rendered `description` equals its `## Description` | architecture/F1, architecture/F5 | Requirements |
| architecture/T4: Core admits `Architecture` as a Capability, with `URBAN`, into a fresh Engine, and the Engine verifies; the ownership claim names it by kind `capability`, name and id | architecture/F3 | Requirements |
| architecture/T5: the Node `Architecture` states that Requirements states what must hold and that Architecture places the behaviour a Requirement asks for | architecture/F4 | Requirements |
| architecture/T6: the packed package holds exactly the two Nodes, the Agent Skill, `contract.json`, README, LICENSE and `package.json`, and exports only `./package.json` | architecture/F6, architecture/A1 | Architecture |
| architecture/T7: no file the package ships imports a module, and its `package.json` has no `dependencies` | architecture/N1 | Architecture |

## RED evidence

At `architecture/C4`, six tests are RED and architecture/T7 is GREEN, as planned. They run with `npm run build -w kaal-hosting -w kaal-core && node --test packages/skills/kaal-architecture/test/plan/love.test.mjs`, outside the package's `npm test` until `architecture/C5`, so the collector's lanes stay green.

| Test | Result at `architecture/C4` |
| --- | --- |
| architecture/T1 | RED, **blocked before behavioural assertion**: `contract.json` does not exist |
| architecture/T2 | RED, **blocked before behavioural assertion**: `contract.json` does not exist |
| architecture/T3 | RED on its behavioural assertion: the Agent Skill has no `## Description` section |
| architecture/T4 | RED on its behavioural assertion: `Architecture` is typed `KAAL Skill`, not `KAAL Capability` |
| architecture/T5 | RED on its behavioural assertion: the Node does not state its boundary with Requirements |
| architecture/T6 | RED on its behavioural assertion: the packed package does not hold `contract.json` |
| architecture/T7 | GREEN: it guards `architecture/N1` through the DO Change, and no Defect traces to it |
