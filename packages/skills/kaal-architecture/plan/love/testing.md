# Packaging Readiness (LOVE): Testing

The planned outer tests will live in `packages/skills/kaal-architecture/test/plan/love.test.mjs`, written in `architecture/C4` and turned GREEN by `architecture/C5`. Each title names the contracts it checks. They are immutable to DO and CHECK. Core's conformance Test Cases are Core's: Engineering runs them against `contract.json`, and Architecture does not copy them. What RED and GREEN mean, and what counts as evidence, is Testing's.

| Test | Checks | Loop |
| --- | --- | --- |
| architecture/T1: `contract.json` names Core's `Installation Contract` as its format, the Capability `architecture`, the package's version, one `directory` asset from `skills/kaal-architecture` to `.agents/skills/kaal-architecture` without `surface`, the record `.kaal/state/architecture/installation.json`, Node 24, and `provides` the Skill `kaal-architecture` | architecture/F1, architecture/N2 | Requirements |
| architecture/T2: for every file under the Skill's target, the catalogue holds exactly the SHA-256 of its shipped bytes, and the contract's version equals `package.json`'s | architecture/F1, architecture/F2 | Requirements |
| architecture/T3: Engineer Skill's `readSkill` finds the Agent Skill conformant with a frontmatter `description`, and its body has no `## Description` section; Core's `realizeIn`, given the Agent Skill and `contract.json`, in an empty repository with no providers declared, places the Skill only at `.agents/skills/kaal-architecture/`, byte for byte as shipped, and registers each file's SHA-256 and version in `.kaal/state/architecture/installation.json` | architecture/F1, architecture/F5 | Requirements |
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

At `architecture/C7`, the amended architecture/T2 and architecture/T3 are recorded again, on `kaal/architecture` before `architecture/C6`. architecture/T1, architecture/T4–architecture/T7 are unchanged and give the results above.

| Test | Result at `architecture/C7` |
| --- | --- |
| architecture/T2 | RED, **blocked before behavioural assertion**: `contract.json` does not exist |
| architecture/T3 | RED, **blocked before behavioural assertion**: `kaal-engineer-skill` does not yet export `readSkill` on `kaal/architecture` (it arrives with `architecture/C6`) |
