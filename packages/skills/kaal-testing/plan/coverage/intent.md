# Coverage Script: Intent

This is `testing/C23`, a PLAN Change. It ships no code. Its DO turns its planned tests GREEN.

It answers a cross-capability ask from Engineering's `engineering/C6` (#625). That ask follows Core's release PLAN `core/C28` (#622, core/A36): once kaal-core's `npm test` becomes the consumer's entry and its publisher tests move to `test:publisher`, Engineering's evidence lane must measure `test:publisher`. Today `cover` in `kaal-testing/coverage` always runs `npm test --if-present`, so it cannot.

What stays as it is:
- `cover` measures the code a capability delivers, executed by that capability's own tests. What is delivered, and which script a lane chooses, stay the caller's: Engineering's rule picks the script, and Testing only runs the one it is given.
- With no script named, `cover` runs exactly what it runs today.

- **testing/I12**: Coverage measures the run the caller asked for, and only that run. A script the workspace does not declare is no run at all, so it is never a passing one.
