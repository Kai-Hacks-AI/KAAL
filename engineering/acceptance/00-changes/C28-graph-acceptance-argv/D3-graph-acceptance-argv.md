# engineering/D3: the kaal-graph Acceptance test passes every Node path in one command-line argument

Owner: Engineering (the Acceptance lane). Raised on 20 November 2026 from the red `Acceptance (Windows)` check on the PLAN of retro/C4 (#2152).

## Record

```json
{
  "id": "engineering/D3",
  "context": "engineering (Acceptance, kaal-graph scenario, packages/kaal-graph/test/acceptance/graph.test.mjs)",
  "expected": "The scenario \"reads Core's genesis Node…\" passes on every host however many Nodes the repository holds.",
  "observed": "It passes `JSON.stringify` of the path of every front-matter Markdown file in the repository as one argument of a child process. On Windows the whole command line is limited to 32767 characters, and Windows quoting escapes every quote of the JSON, so the child fails with `spawn ENAMETOOLONG`.",
  "where": "packages/kaal-graph/test/acceptance/graph.test.mjs (the `identity` scenario, its `run(process.execPath, [..., JSON.stringify(claimants()...)])` call)",
  "status": "answered",
  "tests": ["engineering/T1239"]
}
```

## What is shown, and what is not

Shown: the list travels in argv. Measured on `main` at 5f6a6e3: 348 paths, 30732 characters of JSON before any Windows quoting, with the lane's checkout path `D:\a\KAAL\KAAL`; the quoting and the script text come on top, so the line sits at or past the limit. Retro's PLAN (#2152) adds 7 Nodes and reaches it.

Not shown by Case T1239: the failure on Windows itself, which only the Acceptance (Windows) check shows. The Case judges the cause, the list in argv, on the host the Engineering job runs on.

State: `main`. No package or production state is affected: the test is not part of any published package.

## Cases

| Identity | Role | File |
| --- | --- | --- |
| engineering/T1239 | RED on 5f6a6e3: the test passes no list of Node paths through the arguments of a child process | T1239.test.mjs |
