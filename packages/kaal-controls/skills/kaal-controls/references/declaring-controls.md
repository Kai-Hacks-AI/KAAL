# Declaring and finding controls

A control a repository wants to manage is a Markdown file whose frontmatter holds exactly:

```
id: <capability>/CTL<n>
title: verify Stages (Developing)
description: One short sentence on what the control is for.
type: detective
has: [<capability>/I3]
```

- `type` is mandatory and is one of `directive`, `preventive`, `detective` or `corrective`, in lower case. It says what the control does when the rule is broken (see the types in the Skill), not how it is built. A missing or other value refuses the control.
- `has` lists the Intents the control has, at least one. The control names nothing else: the Requirements, the Architecture and the mechanism are reached from the Intent.
- It stores no state and no pointer to its test. A Case that tests the control points back to it with a first line `// Case <id> tests: <control id>`, and sits beside the control, as `CTL<n>-<slug>/CTL<n>.md` and `T<n>.test.mjs`.
- Ids are unique. A Change id such as `<capability>/C8` is not a control.

To list every control in a directory, run `node scripts/find-controls.mjs <directory>` from this Skill. It prints `controls` (id, title, description, has, path and the Cases that point at each) and `refused` (an item that is malformed or duplicated, with the reason). It only finds: it does not resolve an Intent, walk to Requirements or Architecture, run a Case or check a gate, so a listed control is not a checked one.
