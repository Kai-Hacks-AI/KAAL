# Process facility: RED evidence (hosting/C109)

`04-test/engineering-check/plan/process-facility.test.mjs` (hosting/T206–hosting/T213) was run against the collector's build before any source change (source stashed, rebuilt, run):

```
✖ hosting/T206 … ✖ hosting/T207 … ✖ hosting/T209 … ✖ hosting/T210 … ✖ hosting/T211 … ✖ hosting/T212 … ✖ hosting/T213
ℹ pass 0   ℹ fail 7   ℹ skipped 1   (hosting/T208 applies only where the host realizes npm as a shim)
```

The first GREEN run exposed one error in the Cases themselves, corrected before the Cases were committed: hosting/T206 built its Windows script path with the running host's path rules, so it could not pass on Linux or macOS; it now uses the Windows path rules, and `startPlan` does too whenever the platform is `win32`.

## Codex findings at 0f19426 (both P2, both reproduced)

Two Cases were added first and failed on the code at 0f19426, then the code changed:

```
✖ hosting/T214 (npx was resolved only beside Node, though npm_execpath named an installation holding npx-cli.js)
✖ hosting/T215 (npm_config_userconfig inherited from the base still pointed at the user's file; a variable of another case was kept)
ℹ pass 7   ℹ fail 2
```

## Codex findings at 2d2e46d

- P2, a relative `dir` gave paths that mean something else in a child with another working directory: `hosting/T216` was added first and failed (`ℹ pass 9, ℹ fail 1`); `dir` is now resolved first.
- P1, the installed-package Cases hosting/T24 to hosting/T31 and hosting/T75 are immutable planned Cases and must not be edited: `plan/release.test.mjs` is restored to the collector's version, and the prepared installation lives in successors, `publisher/prepared-release.test.mjs` (hosting/T217 to hosting/T225), with the originals' assertions unchanged. The originals are skipped by name in `test:publisher`, as the Cases superseded by hosting/T173 to hosting/T175 are.
