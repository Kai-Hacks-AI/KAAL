# C36 do

The DO of the merged PLAN (#2567), approved by the CPO.

- **Source:** `skills/kaal-engineering/references/write-areas.json`. Rows `{ path, phase }` for PLAN, DO (source only) and ACT; `01-changes` has `delegatedTo: kaal-change` and no phase; `14-operations/controls/*/baseline.json` has `transition: controls` and no phase; control declarations are PLAN. Legacy folder names are an alias list. The seven pull request types are listed with the areas each may carry and how it is recognised. A short "Write areas" section in `package-layout.md` points to the file.
- **Cases:** T1550 to T1553 were RED because the file did not exist and are now GREEN, unchanged. The rest of the engineering Cases are unchanged and GREEN, except T1178 (`check-skill`), which is RED here before and after this change on the same checkout and is not touched by it.
- **What this Change does not do:** it ships no resolver (release's matcher reads the file), installs nothing and changes no ruleset. As the CPO notes, the delegated Change folder contract (kaal-change) and the Controls allowance transition contract are needed before the combined write map is adopted operationally.
