# engineering/C21 minimatch resolution

A HOTFIX, run deliberately as an exercise of the Hotfix path. Dependabot alert 3 (GHSA-g3hv-75wg-m249, medium) is real, but too weak to justify a hotfix on its own merit; this Change is the Test Case, the Defect and the correction that provoke the path.

The Defect is engineering/D2: the root lockfile resolves `minimatch` 10.2.6, which is inside the advisory's range (>= 7.0.0, < 11.0.1; fixed in 11.0.1). The Case engineering/T385 reads the lockfile and fails while any resolved `minimatch` is in that range. The correction is one root `overrides` entry, `minimatch: 11.0.1`, and the regenerated lockfile. Nothing else changes.

Not in this Change: the `glob` alert (engineering/D1, its own HOTFIX, engineering/C20), an upgrade of c8 or of kaal-testing, and any wiring.
