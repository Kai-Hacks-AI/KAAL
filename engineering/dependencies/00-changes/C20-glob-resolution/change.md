# engineering/C20 glob resolution

A HOTFIX, run deliberately as an exercise of the Hotfix path. Dependabot alert 1 (GHSA-3g3m-2fjr-6pw4, medium) is real, but too weak to justify a hotfix on its own merit; this Change is the Test Case, the Defect and the correction that provoke the path.

The Defect is engineering/D1: the root lockfile resolves `glob` 13.0.6, which is inside the advisory's range (>= 9.0.0, <= 14.0.1; fixed in 14.0.2). The Case engineering/T384 reads the lockfile and fails while any resolved `glob` is in that range. The correction is one root `overrides` entry, `glob: 14.0.2`, and the regenerated lockfile. Nothing else changes.

Not in this Change: the `minimatch` alert (engineering/D2, its own HOTFIX), an upgrade of c8 or of kaal-testing, and any wiring.
