# C33 do

The DO of the merged PLAN (#2387).

- **Source:** in `13-source/workflows/codeql.yml` the one `actions/checkout` of each gate job (`verify CodeQL analysis`, `verify CodeQL findings`) now has `ref: ${{ github.event.repository.default_branch }}`, with `persist-credentials: false` kept. The judge and `judge-mode` therefore come from the default branch, not from the pull request, so a pull request that edits them no longer judges itself. Nothing else in the file changed.
- **Cases:** T1413 (one checkout of the default branch, no credentials, nothing of the pull request) and T1414 (no `GITHUB_SHA` or `GITHUB_REF` override) are GREEN; F93's T1393, T1394 and T1412 stay GREEN.
- **Known residual:** a pull request can still edit the workflow file itself. The Inspector (controls C14) closes that, and delivery-path controls must prevent unauthorized workflow edits before the checks become preventive.
- **What this Change does not do:** it installs nothing. `.github/workflows/codeql.yml` is untouched; the release WIRE installs the source on Kai's go. No ruleset change and no removal of the legacy rule.
