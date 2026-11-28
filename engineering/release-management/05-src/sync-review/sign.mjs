// release/C173: sign Sync. Posts the check run `verify Sync` as the KAAL Inspector, through Hosting's postCheckRun (hosting/C117), at
// the head of the one verify run whose verdict was bound (provenance.mjs). It decides nothing: PASS gives success, FAIL gives
// failure, and an UNKNOWN or refused verdict posts nothing, so whoever judges the check abstains. One POST, no retry. Hosting is
// handed in so a Case can run this without GitHub; the workflow passes the package built from the default branch.
export const CHECK_NAME = 'verify Sync';

export const conclusionOf = (verdict) => {
  if (!verdict || typeof verdict !== 'object') return null;
  if (verdict.outcome === 'PASS' && verdict.passes === true) return 'success';
  if (verdict.outcome === 'FAIL') return 'failure';
  return null;
};

export async function sign({ verdict, head, repo, runId, env, hosting, out, log, error }) {
  const conclusion = conclusionOf(verdict);
  if (!conclusion) { log('sign Sync: nothing posted: there is no verdict that passes or fails at this head'); out('signed', 'none'); return 0; }
  if (!env.KAAL_APP_INSPECTOR_ID || !env.KAAL_APP_INSPECTOR_KEY) {
    error('sign Sync: no Inspector credential', 'the KAAL Inspector App id or key is not set, so verify Sync cannot be signed and nothing is approved');
    out('signed', 'none');
    return 1;
  }
  try {
    const grant = await hosting.mintToken({ app: 'inspector', appId: env.KAAL_APP_INSPECTOR_ID, privateKey: env.KAAL_APP_INSPECTOR_KEY, repo, abilities: ['post-checks'] });
    const reasons = (verdict.reasons ?? []).map((r) => `- ${r.code}: ${r.detail}`);
    const posted = await hosting.postCheckRun(repo, {
      name: CHECK_NAME, revision: head, conclusion,
      title: `verify Sync: ${verdict.outcome}`,
      summary: [`verify Sync judged this head of the SYNC: ${verdict.outcome}.`, ...reasons].join('\n'),
      externalId: `sync-verify:${runId}`,
    }, { grant });
    log(`sign Sync: posted ${CHECK_NAME} ${conclusion} at ${head} as ${posted.signer}`);
    out('signed', conclusion);
    return 0;
  } catch (e) {
    error('sign Sync: the check could not be posted', String(e?.message ?? e).slice(0, 200));
    out('signed', 'none');
    return 1;
  }
}
