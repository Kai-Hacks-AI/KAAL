# Evidence

## 1. Fresh-Agent discovery test (Intent question 6)

**Protocol.** Three read-only copies of `kaal/genesis` at dfe6d56, without `.git`. Each Agent was told its whole world was one copy, to start from `AGENTS.md`, that nobody would explain KAAL, and to answer seven tasks with the capability used, STATUS (BUILT / PARTIAL / NOT BUILT, judged from the repository) and a cited path. Same prompt, same model, one run each, under 600 words.

- **Arm A, control:** unchanged `AGENTS.md`.
- **Arm B, TALL:** `AGENTS.md` plus a ten-line paragraph: KAAL as the Agent's body of knowledge and capabilities, the four dimensions as the Intent states them, candidate Skills `kaal-thinking` and `kaal-learning` named as candidates.
- **Arm C, neutral:** `AGENTS.md` plus a paragraph of equal length listing the kinds of part (Core, Skills, Extensions, Changes, Packages) with no TALL and no status.

Tasks: (1) find held knowledge without reading everything; (2) make a learning reusable; (3) change a file under governance; (4) a client reports KAAL misbehaviour; (5) give a KAAL-less repository a capability; (6) say what is built and what is only designed, four of each; (7) use KAAL's "thinking" capability (none exists: a trap for over-claiming).

**Results.** Each Agent opened about 40 files.

| Task | A control | B TALL | C neutral |
|---|---|---|---|
| 1 find knowledge | PARTIAL, nothing built, found the BRAIN longing in a retro | NOT BUILT, named `find`/`near`/`show` and the 08/04 prototype | NOT BUILT, found nothing designed |
| 2 reusable learning | `kaal-retro`, noted nothing indexes it | `kaal-retro`, named `kaal-learning` and BRAIN as candidates | `kaal-retro`, noted nothing finds it |
| 3 governed change | `kaal-changing`, correct | same, correct | same, correct |
| 4 client report | `kaal-incident` / `kaal-request` / `kaal-collecting`, correct, noted not installed in `.kaal` | same, correct | same, correct |
| 5 install | `list-kaal-capabilities`, `install-kaal --select <ID>`, correct | same, correct | same, correct |
| 6 built vs designed | four-plus of each, including BRAIN | four-plus of each, including `kaal-thinking`, `kaal-learning`, Processes, modes | named built parts; **could not name four designed ones** |
| 7 "thinking" | NOT BUILT | NOT BUILT | NOT BUILT |

No Agent over-claimed a thinking capability. Arm B's honesty on task 7 is attributable to the word "candidate" in the paragraph it was given; an unqualified list of four capabilities was not tested.

**Reading.**

1. Tasks 3, 4, 5, 7 (the built capabilities) came out identical in all arms. The existing entry point, Core's references and the Skills' `description` fields are enough. TALL did not improve discovery of what exists.
2. The arms differed on task 6 only, on knowing what is designed. The control found it by reading Changes. The neutral paragraph, which told the Agent where to look for parts but nothing about status, did worst: it never reached the Changes that hold the target architecture. The TALL paragraph did best, because it named the targets. The benefit is therefore **stating that targets exist and what they are**, which #74's built/target table does without any acronym. A fourth arm (status table, no TALL) would separate the two; it was not run.
3. All three Agents noticed that `kaal-incident`, `kaal-request`, `kaal-review` and `kaal-intent` exist in `packages/` but are not installed in `.kaal/skills`. That is a discoverability gap independent of TALL.
4. In arm B the Living dimension was read as the three modes alone, reported as not implemented, so the incident, request and collecting Skills used for task 4 were not recognized as Living. A dimension name read as a place to look for a capability invites this; it is the risk the Intent anticipated.

**Limits.** One run per arm, one model, a small set of tasks written by the Worker who also holds the ground truth, and a paragraph written by the same Worker. The result shows no gain from TALL on discovery; it does not show TALL is harmful or that a differently written paragraph could not help.

## 2. Checks made

- Allocation: `next-change` on `kaal/genesis` gives `09/02`, so that is the number here. #69 and #74 hold `09/02` too and #75 holds `09/03`; whichever lands later renumbers (allocation is optimistic). I first took `09/04` to avoid the clash, and `test-kaal` rejected it: the record test requires `09/01..` with no gap on this base.
- `packages/kaal-learning/` and `brain/` do not exist on `kaal/genesis`; `find`/`near`/`show` exist only as the prototype in `08/04/work/04-evidence.md`.
- `AGENTS.md` and `.kaal/AGENTS.md` carry no mention of TALL, BRAIN or a thinking capability.
- Nothing outside `.kaal/changes/genesis/26/10/09/02/` is touched.
