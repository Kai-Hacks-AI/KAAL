# The declaration: `integration.kaal.json`

One file at a package's root, beside `ownership.kaal.json`. The capability owns it. It is data.

```json
{
  "owner": { "kind": "capability", "name": "Testing", "id": "<the ownership claim's id>" },
  "package": "packages/kaal-testing",
  "mechanisms": [ ... ],
  "judgment": [ "what is deliberately left to judgment" ]
}
```

`owner` must equal the `owner` of the package's `ownership.kaal.json`. `package` is the package directory, relative to the repository root.

## A mechanism

| Field | Meaning |
| --- | --- |
| `name` | unique within the file |
| `level` | `script`, `skill` or `agent` (BASS: executable behaviour, or guidance an agent is given) |
| `kind` | `check`, `measure`, `remind` (all `script`) or `judgment` (`skill`/`agent`) |
| `docs` | a file in the package that documents it |
| `invoke` | `script` only: `{ "module": "lib/x.mjs", "export": "f" }` or `{ "command": ["node", "scripts/x.mjs"] }` (an argument list, no shell, run from the package root) |
| `fixtures` | `script`: the name of a set in the fixtures module the capability owns. A `check` offers `clear`, `report` and `unknown`, each `{ "args": [...] }`; a `measure` offers `clear`; a `remind` offers `remind` |
| `outcome`, `reason` | `check` only. `outcome` = `{ "at": "<path into the result>", "clear": [...], "report": [...], "unknown": [...] }`. A value belongs to one outcome. A path through `[]` that yields nothing reads clear. `reason` lists paths whose strings explain a non-clear result |
| `skill`, `section`, `shape`, `activation` | `skill`/`agent` only: the Skill file and section an agent is given; `shape.fields` is what comes back; `activation` = `{ "when": "<situation>", "invoke": "<name of a remind mechanism>" }` |

A module's result is its returned value. A command's result is `{ "exit": n, "stdout": <parsed JSON or text> }`, so a reader may use `exit`.

## What the Cases require

F1 the file reads and names its owner; F2 a `script` mechanism runs from its declaration with stdin closed, returns data and changes nothing in its package; F3 a `check` reads as clear, report or unknown, an undecidable input never as clear, every non-clear result with a reason; F4 the three fixtures reach three distinct outcomes; F5 a judgment mechanism names its Skill, section and result shape and claims no outcome; F6 the declaration names no hook, workflow, ruleset, branch or queue; F7 the activation names a declared `remind` mechanism whose result carries a `reminder` of at most 280 characters naming the Skill and the section, and the declaration holds no reminder text.

## Reading a result

The declared reading (`outcome`) is the only supported way to read a result. A capability's own fields stay its own and may mean something else: for example Testing's `accept().passed` stays true while unknown findings exist, so a caller must read `findings[].kind`, as the declaration says, never `passed` alone.
