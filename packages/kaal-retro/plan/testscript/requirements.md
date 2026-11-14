# Requirements (retro/C3)

R1 `npm test` run in `packages/kaal-retro` builds kaal-core and runs retro/T1 to T15, and exits 0 when they pass.

R2 The package stays out of the root workspaces: no workspace flag may name a package that only exists as a workspace, and nothing is added to the root.

R3 The installable Skill, the Nodes and the ownership claim are unchanged.

R4 The record of retro/C2 is corrected: its DO text says `npm test` gave 15 pass, which was not what was run. C3's DO states what was run (`node --test`) and what the script now does, and C3's ACT records the miss.

Deliberately not required: wiring, publishing, registering Retro in `.kaal/`, or any change to the root.
