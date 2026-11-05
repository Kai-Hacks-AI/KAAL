# Process facility: RED evidence (hosting/C109)

`04-test/engineering-check/plan/process-facility.test.mjs` (hosting/T206–hosting/T213) was run against the collector's build before any source change (source stashed, rebuilt, run):

```
✖ hosting/T206 … ✖ hosting/T207 … ✖ hosting/T209 … ✖ hosting/T210 … ✖ hosting/T211 … ✖ hosting/T212 … ✖ hosting/T213
ℹ pass 0   ℹ fail 7   ℹ skipped 1   (hosting/T208 applies only where the host realizes npm as a shim)
```

The first GREEN run exposed one error in the Cases themselves, corrected before the Cases were committed: hosting/T206 built its Windows script path with the running host's path rules, so it could not pass on Linux or macOS; it now uses the Windows path rules, and `startPlan` does too whenever the platform is `win32`.
