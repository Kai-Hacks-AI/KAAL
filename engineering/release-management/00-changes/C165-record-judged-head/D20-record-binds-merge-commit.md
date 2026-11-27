# release/D20: a record names the merge commit of the run, not the head it judged

Owner: the release capability. Raised on 27 November 2026 from the first provoked run of check 1 (#2816).

## Record

```json
{
  "id": "release/D20",
  "context": "release (the entries of check 1, release/CTL42 and release/CTL23, through the shared command line)",
  "expected": "The record a run writes names the revision judged: the head of the pull request (release/C153, evidence kind V), so that a run can be matched to the old check on the same revision.",
  "observed": "On pull_request, GITHUB_SHA is the test merge commit of the run. The record carries it as `sha` (#2816: head d836d936, record sha d4751363), so no record can be matched to the revision of a pull request and the DIRT Running fact would read none of them.",
  "where": "engineering/release-management/05-src/change-isolation/lib/report.mjs, `cli`, the boundary",
  "reach": "main; the same line is in release/C158 (lineage/lib/answer.mjs) and release/C159 (promotion-source), which are collectors and are repaired there before they promote",
  "status": "confirmed",
  "tests": ["release/T1603"]
}
```

## What is shown, and what is not

Shown: the log of #2816 prints `kaal-control {"control":"release/CTL42",...,"sha":"d4751363..."}` while the head is `d836d936...`, and T1603 reproduces it with a command line that gives `--head` and an environment whose GITHUB_SHA is another commit.

State: `main`. No package or production state is affected, and no verdict changes.

## Cases

| Identity | Role | File |
| --- | --- | --- |
| release/T1603 | RED on main: the boundary carries GITHUB_SHA; GREEN when it carries the head of the command line; no head or no run id gives no record | T1603.test.mjs |
