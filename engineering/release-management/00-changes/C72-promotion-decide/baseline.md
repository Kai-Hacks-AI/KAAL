# C72 baseline

The baseline is `main` at 16a5a7d (release/C67 and release/C62 promoted by #1911 and #1913).

- `engineering/release-management/05-src/` holds `sync-review`, `pull-promotion` and others; there is no source that raises a PROMOTION.
- A collector is `kaal/<capability>/<concern>`. Its PLAN, DO and ACT squash into it; the ACT lands after all Cases are green. The PROMOTION is a pull request `PROMOTION: <description>` from the collector into main with the Change id in its body.
- Seen on 18 Nov 2026: the PROMOTIONs #1911 and #1913 were raised by hand after the ACTs #1891-era and #1906.
