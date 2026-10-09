# Advance the checked-in projection to Core's Extension

## Intent

Core's `Extension` KAAL Definition and its seal arrived in the packages with 06/06, which could not update the installed `.kaal` under Core isolation, and the installer learned Extension delivery with 06/07. The checked-in `.kaal` therefore lags the packages by exactly those two files. Advance it with the repository's own installer, so that the lineage holds what its packages deliver again. This is I of the sequence accepted on #54: produced by the installer with the complete Extension-aware delivery, not authored.

## Requirements

R1. The change is the output of `npm run install-kaal` on current `kaal/genesis`, and nothing else: `.kaal/core/Extension.md` and its seal `.kaal/seals/b2bf7b53f7f5a29776ce457af85dcebd7213cf963981f046174c253a0794d68a`, the bytes Core delivers.

R2. After it, `npm run check-kaal-install` over the checked-in tree reports nothing: the lineage projection is current.

R3. It is append-only: no existing file or seal changes, so every Node seal and every closed Change of the baseline is preserved.

R4. Nothing else changes: no package, no engineering, no `.github`, no other `.kaal` file, no Core.

## Architecture

None is authored. The installer derives what the packages deliver for the installed Skills and Extensions from Core's own answers, registers them into a throwaway KAAL and projects the result; the two new files are Core's payload. No Extension or Skill package is added, so no `extensions/` or `skills/` tree appears.

## Evidence

- `git status` after `install-kaal` shows exactly the two new files; `check-kaal-install` is green before this Change is committed and was red naming exactly them on `kaal/genesis`.
- `preserve-kaal-seals` and `preserve-kaal-changes` hold against `kaal/genesis`, and the whole root `npm test`, `check-kaal-seals` and `check-kaal-changes` pass.
- The installed `.kaal/core/Extension.md` is byte-identical to `packages/kaal-core/artifacts/core/Extension.md`.

## Not done here

- `packages/kaal-github`, the first Extension package, and the rebuilt C2.
- The lineage projection-currency control: it is folded into C3, so until then a lagging projection is visible only by running `check-kaal-install`.
