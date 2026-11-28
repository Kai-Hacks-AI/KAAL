// release/C173: where a verdict of verify Sync comes from, and whether it is about the pull request as it is now. Pure: the facts
// are handed in. The verdict is trusted only when it comes from the verify workflow's own completed run (the `workflow_run` event
// names that run) and names the same run, head sha, base ref and base sha as that run and as the pull request now. Every refusal
// says what was missing, and a refused verdict approves nothing.
export const VERIFY_WORKFLOW = 'sync verify';
const LANES = ['kaal/', 'hotfix/', 'wire/'];

// envelope: the file the verify run uploaded, or null. run: the event's own facts about the verify run. pull: the pull request now.
export function checkProvenance({ envelope, run, pull, repo, requireSuccess = true }) {
  const refusals = [];
  const no = (code, detail) => refusals.push({ code, detail });
  if (!run || run.name !== VERIFY_WORKFLOW) no('wrong-workflow', `the run is of ${run?.name ?? 'no workflow'}, not of ${VERIFY_WORKFLOW}`);
  if (run && run.event !== 'pull_request') no('wrong-event', `the verify run was started by ${run.event ?? 'no event'}, not by pull_request`);
  if (requireSuccess && run && run.conclusion !== 'success') no('run-not-success', `the verify run concluded ${run.conclusion ?? 'nothing'}, not success`);
  if (!envelope || typeof envelope !== 'object') no('no-artifact', 'the verify run uploaded no readable verdict');
  else {
    if (String(envelope.runId) !== String(run?.id)) no('other-run', `the verdict names run ${envelope.runId ?? 'none'}, not run ${run?.id ?? 'none'}`);
    if (envelope.head !== run?.head) no('other-head-than-run', 'the verdict names another head than the verify run');
    if (!envelope.verdict || typeof envelope.verdict !== 'object') no('no-verdict', 'the file holds no verdict');
    else if (envelope.verdict.analyzed?.head !== envelope.head) no('verdict-head', 'the verdict judged another head than the file names');
  }
  if (!pull) no('no-pull-request', 'the pull request cannot be read');
  else {
    if (pull.state !== 'open') no('not-open', `the pull request is ${pull.state}`);
    if (pull.headRepo !== repo) no('fork', `the head repository is ${pull.headRepo ?? 'unknown'}, not ${repo}`);
    if (!LANES.some((l) => String(pull.baseRef).startsWith(l))) no('base-not-a-lane', `the base ${pull.baseRef} is not a kaal/, hotfix/ or wire/ branch`);
    if (envelope) {
      if (String(envelope.pr) !== String(pull.number)) no('other-pull-request', 'the verdict is of another pull request');
      if (envelope.head !== pull.head) no('head-moved', 'the head moved after verify Sync judged it');
      if (envelope.baseRef !== pull.baseRef) no('retargeted', `the pull request base is ${pull.baseRef}, the verdict judged ${envelope.baseRef}`);
      if (envelope.verdict?.analyzed?.base?.tip !== pull.baseSha) no('base-moved', 'the base moved after verify Sync judged this head');
    }
  }
  return { ok: refusals.length === 0, refusals, verdict: refusals.length === 0 ? envelope.verdict : null };
}
