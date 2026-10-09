# Architecture (draft, for Owner alignment)

## The shape: three places, linked by arguments, not by layout

```
 Engine (Core, Nodes, Node seals, Skills)      Record (Change dirs + their seals)      Subject (repo / change / PR acted upon)
 where KAAL is installed                       where KAAL keeps what it governed        what the Work is about
            \                                         |                                       /
             \______ none derives the others' location; each is named when used ______________/
```

The machinery that decides what a Change is already takes the Record as one directory argument (for one revision) and reads `changes/<name>/YY/MM/DD/CC/` and `seals/{changes,trees}` inside it (`change-state.mjs`, `engineering/change-seal`, `next-change.mjs`). It never looks at the engine. Two things bind the Record to the engine today, and only these: the **defaults** (`.kaal` written into the root npm scripts, the Skill text and the installer) and the **controls** in `packages/kaal-github` (`KAAL_DIR = ".kaal"`, `RECORD` regex, baseline extraction). So the principle needs a **Record locator** that is explicit, not a new layout.

## What was demonstrated (scratch, existing commands, no code changed)

- The same Change tree sealed in two different Record directories, one outside any repository and one in an arbitrary subdirectory of a repository, has the identical Change ID (`72c9211d...`) in both and is listed `closed` in both. Allocation (`next-change`) and `state` run unchanged against either. A neighbouring Subject directory containing one unrelated file was never read or written.
- Earlier finding (investigation, section 1): copying all 24 real Changes and their seals into a directory of that shape reproduces all 24 IDs and `check` passes.
- **Relocation boundary, scratch Git repository holding the real 24 Changes and 47 seal markers** (prototype assembly, not product code; the predicate is the existing `preserve-changes`):

| Baseline read from | Candidate | Result |
|---|---|---|
| target revision, locations `.kaal` and `records` | intact relocation to `records/` | preserved |
| target revision, locations `.kaal` and `records` | relocation omitting closed Change `05/03` | refused, `05/03` named |
| one locator `records` for both revisions | the omitting relocation | **preserved (wrong)**: the baseline is empty |
| one locator `.kaal` for both revisions | the intact relocation | **refused (wrong)**: the candidate is empty |
| a location the candidate chose (none) | the omitting relocation | **preserved (wrong)**: the candidate hid the baseline |

  The first two rows are the design; the last three show why the locator cannot be one parameter and why the baseline locator cannot come from the candidate.
- Not demonstrated, and not claimed: the full lifecycle in a non-`.kaal` Record dir (acceptance covers it only for `.kaal`-shaped dirs), and the product controls themselves (`withBaseline` still reads `.kaal` only; the rows above use a scratch assembly in front of the existing predicate).

## How the three modes hold

| Mode | Engine | Record | Subject | What differs |
|---|---|---|---|---|
| Engineer | `.kaal/` of this repo (projection of packages) | This repo, at a location this repo chooses (today inside `.kaal/`) | This repo | Only where the Record is declared; nothing else |
| Embed | `.kaal/` in the host | In the host repo, at a location the host chooses, or elsewhere | The host repo | The host owns the choice and the byte guards for it; the engine ships no layout |
| External | Anywhere (not in the Subject) | A Record store KAAL's operator holds (its own repository or directory) | A repository with no KAAL artifact; Changes name it by reference in their Work | Closure is checked on the Record store, never on the Subject; the Subject is not required to hold any seal |

In every mode a Change is created, worked, reviewed, sealed and judged by the same code on the same shape. A Change about an External Subject records which Subject and which authorized change or PR it concerns **in its own Work text** (the Intent and evidence). KAAL does not interpret that reference; it is how a person or agent finds the Subject.

## The Record locator (smallest mechanism)

One explicit input, `record dir`, supplied wherever a Record is read or written: to the Change scripts, the sealing and admission commands, and the repository controls. It is never derived from the engine's directory. Where a mode wants a default, the default is declared by that mode's instance (for example an instance file, or the root scripts of a repository), not by Core or a sealed Node. The Skill text stops saying "the Record is under the KAAL directory" and says "under the Record directory you are given".

Seals: Change and tree seals are part of the Record (R4), so they live in the Record dir beside the Changes. Node seals stay in the engine. This is what makes External possible without an engine inside the Subject, and it keeps the Record self-contained.

## Controls: baseline and candidate Records are resolved independently

Owner review of `0f87e2b` (P2) found that a single Record parameter is wrong. `withBaseline` extracts the given path from the target revision; with one locator for both revisions, moving Records from `.kaal` to `records` either empties the baseline (select `records`: nothing is preserved) or empties the candidate (select `.kaal`: the intact move is rejected). Corrected design:

1. **Two resolutions, two sources.** The *baseline Record* is assembled from the **target revision** using the Record locations **that target revision declares**. The *candidate Record* is assembled from the **candidate checkout** using the locations the candidate declares. Each revision's Record is the complete set of its declared locations: Change directories and Change/tree seals, merged into one view of the shape the machinery already reads. A Change (or seal) present at the same address in two locations of one revision is refused as ambiguous.
2. **The candidate cannot choose the baseline.** The baseline locations are read from the target revision by Git (`git show`/`git archive` of the target), never from the checkout under test. A candidate that edits its own locator changes only its candidate Record. If its locator hides history, the candidate Record lacks Changes that the baseline Record has, and preservation refuses, because the comparison is "every Change closed in the baseline is closed in the candidate, by identity".
3. **A bridge lists both places.** While a relocation is in flight, the target revision declares both the old and the new location, so baseline and candidate are both assembled from both. An intact relocation passes (same IDs, different place); a relocation that omits a closed Change is refused. Dropping the old location from the declaration is itself judged by the same rule: it passes only once the history is no longer held there.
4. **First introduction.** A target revision with no declaration has the default location (today `.kaal`), which keeps the existing behaviour, including "a target without `.kaal` has nothing to preserve".
5. **Known limit, unchanged.** The control code runs from the candidate checkout. A candidate that rewrites the controls is protected by the boundary rules and review, as today, not by this design.

For External, the same controls run in the Record store's repository, with its own target and candidate; there is nothing to run in the Subject.

## What stays out

No decision about a root `changes/` or any other name (R2). No move of the 24 Changes or their 47 seal markers (R7, R8). No Core, Node or `.github/` change except README text, and that as its own Change. No answer for carriers, collections or `clients/` (R10, R13), only the constraint that the Record locator not be Changes-only.

## Candidates for the layout (all subordinate to the locator)

- **C0** Engineer keeps `.kaal/changes` and `.kaal/seals/{changes,trees}`; every other mode names its Record dir. Nothing moves. The principle is met by naming, not by relocation.
- **C1** Engineer and Embed adopt a root `changes/` and seals beside it (the original candidate). Valid, but one default among several, not the model.
- **C2** Embed hosts name their own Record dir. External uses a separate store.

C0 is the smallest change that makes the boundary true everywhere and moves no sealed history. C1 can be adopted later for Engineer as a pure relocation, by identity, once R8 is shown.

## Smallest safe transition (proposal; nothing authorized)

1. Show R8 for the three modes with a Record dir argument and a controls bridge (Record-dir-aware `withBaseline` and `RECORD`); old and new default both accepted.
2. Make the root scripts, Skill text and installer take the Record dir, with `.kaal` as Engineer's declared value.
3. Only then, a separate decision whether Engineer relocates its Record (C1), with seals, as its own Change.
4. Drop any bridge. `.github/README.md` text, alone.

## Genuine forks for the Owner

- **F1** Where is the Record dir declared by default? (a) only as an argument everywhere, no default; (b) an instance-owned file in the engine (`core/config` is already instance-owned); (c) per-mode script defaults. I recommend (a) for the processes and (c) for this repository's root scripts, nothing in the engine, until a mode shows pressure.
- **F2** Do Change and tree seals move with the Record in all modes, as R4 says? I recommend yes. In Engineer that is a decision for step 3, not now.
- **F3** Is C0 acceptable as the stopping point of this Change, with C1 left open? I recommend yes.
- **F4** How an External Change names its Subject and authorized PR: free text in the Intent, or a small stated form? I recommend free text until a real External Change shows what is repeated.
