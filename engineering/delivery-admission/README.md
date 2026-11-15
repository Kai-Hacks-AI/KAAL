# Delivery admission

Engineering's rule for which branches `main` admits: `kaal/<capability>/*`, `hotfix/*` and `wire/*` of this repository. A `hotfix/*` or `wire/*` head must have every check its own branch ruleset requires green on the exact head sha. The rule lives in `engineering/github/lineage.ts` (`promotionSource`) and runs in the existing Promotion Source check. See `00-changes/C16-delivery-admission/change.md`.
