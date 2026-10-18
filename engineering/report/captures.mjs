// Reading the coverage evidence the test lanes captured (lanes/evidence.mjs)
// into the coverage results Testing's report reconciles, without running
// anything. A capture is evidence for this tree only when it was taken at this
// tree's commit. A workspace with no capture, or only a capture of another
// commit, is unknown: it is reported as such, never as zero and never as a
// pass. A capture whose measurement failed stays a failed measurement.

/**
 * The coverage results for `workspaces` (names), from `files`, a captures
 * directory as Hosting reads it ({ "<workspace>/capture.json": bytes }), for
 * the tree at `commit`. Returns { coverage, captured }: one result per
 * workspace, and the provenance of each capture used, by workspace.
 */
export function fromCaptures(files, workspaces, commit) {
  const coverage = [];
  const captured = [];
  for (const workspace of [...workspaces].sort()) {
    const bytes = files[`${workspace}/capture.json`];
    if (bytes === undefined) {
      coverage.push({ workspace, unknown: `${workspace}: no evidence was captured for this run` });
      continue;
    }
    let capture;
    try {
      capture = JSON.parse(bytes.toString("utf8"));
    } catch (e) {
      coverage.push({ workspace, failed: `${workspace}: its capture is not JSON (${e.message})` });
      continue;
    }
    const at = capture?.provenance?.commit;
    if (commit === undefined || at !== commit) {
      coverage.push({ workspace, unknown: `${workspace}: its capture was taken at ${at ?? "an unknown commit"}, not at ${commit ?? "an unknown commit"}` });
      continue;
    }
    if (capture.workspace !== workspace || capture.result?.workspace !== workspace) {
      coverage.push({ workspace, failed: `${workspace}: its capture describes another workspace` });
      continue;
    }
    coverage.push(capture.result);
    captured.push({ workspace, ...capture.provenance });
  }
  return { coverage, captured };
}
