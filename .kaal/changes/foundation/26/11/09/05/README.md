# Foundation 0.0.2: the roadmap to main and to npmjs

Capability owner: Foundation. Documentation only: a roadmap, not a PLAN or a DO, and no code changes. It authorizes no
promotion, version bump on main, SYNC, ledger entry, release dispatch or npm publication. Each of those needs the
Owner's explicit go, and a CPO approval does not stand in for it. The standard comes before any date; the npm
trusted-publisher date (10 November 2026, 18:03 UTC) is a target, not an authorization.

The roadmap is the order of Changes. Each step is its own Change with its own CPO exact-head review.

## Where it stands

Merged into `kaal/foundation`: the layout map, the Boundary Check PLAN (#1292) and DO (#1293), and the architecture-tree
PLAN (#1294). Open: the carry-forward DO (#1295). The collector's package version is 0.0.2; main carries 0.0.1.

## Steps, in order

1. **Carry-forward (#1295, open).** The 25 ids the Cases cite, plus I5 and I8, are defined in the Nodes; each is placed
   (ours or not ours, then Delivery or Solution). Not-ours ids sit in "Held for <capability>" sections.
2. **Boundary engine and rules (new Change, before the tree DO).** The Owner's rulings of 2026-11-09: boundary tests
   exist in one place only; the engine (walk, finding shape, owner lookup, exit codes) is held by Engineering and used
   across packages; each package ships its rules as Markdown with YAML front matter. The engine reads YAML with the
   repository's `yaml` parser in Engineering only. Foundation stays free of any dependency (N2, N6) and ships no YAML
   parser: Engineering writes each Case's suite and whether it ships into `verify.json`. Open for the Owner: whether
   0.0.2 ships the rules only (recommended later) or keeps the self-contained `scan.mjs`.
3. **Tree DO (C21).** Architecture as a small forest (ours or not ours, then Delivery or Solution); the "Placed here,
   belongs elsewhere" index (A25); `delivery/` folders; a `tests` edge in the front matter of every Case; `ships:
   true/false` derived from the Case's place in Architecture; ids for the untitled Cases; the splits (T15, T17, T18, T46,
   T47, T62); `moved:` tombstones; the BEST suites (Boundary, Engineering, Solution, Targets) computed from the edges,
   with a check that every Case is in exactly one of them; the collector and the build changed accordingly. T64 to T70
   turn GREEN.
4. **Layering Change.** Hosting is the true bottom, and Foundation may use Hosting and nothing else. A1, the Intent,
   `kaal/Foundation.md` and the skill line are corrected. The declaration id changes, and every pin of
   `649fbafb81a8d976b65a4e8c0db7228a194ec515385820d489e4a74041dc27c5` moves.
5. **Collector disposition (the Owner decides).** The 19 non-Foundation paths on the collector are kept, dropped or
   retargeted, and the #1289 record is amended.
6. **Final proof point,** on the final candidate, with every package's own checks run both ways and the repository. It is
   repeated if the collector's contents change afterwards.
7. **Promotion hard review (needs the Owner's go).** Version bump on main, a ledger entry attesting the final candidate,
   release notes (including the bin path move), CPO exact-head approval. Then the collector is terminated and re-cut
   from main.
8. **Release (needs the Owner's go).** The Owner dispatches `release.yml` and approves the `npm` environment.
9. **Verify** the registry's 0.0.2 independently: install it clean and run its `npm test`.

## Later, not on this path

Packaging embeds into KAAL (Engineering) and the other packages use KAAL; the held ids and Cases then move to their
owners wholesale, leaving `moved:` tombstones. The boundary decisions record in the repository and the Engineering-lane
Case that asserts "findings minus decisions is empty" are their own Change.

## Risks

- Step 2 and the tree DO are larger than they look: about fifty Cases move, split or get a `tests` edge.
- Step 4 changes the declaration id, so it lands before the proof point and the proof point runs once.
- The trusted-publisher date may pass before the standard is right; the standard wins.
