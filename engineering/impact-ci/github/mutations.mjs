// Developer-only discrimination runner. Mutate isolated sibling copies, never
// the working sources. Hosting owns file/process mechanics; Linux evidence only.
import { read, initialize, reconcile, execute } from 'kaal-hosting';
import { sha256 } from '@kaihacksai/kaal-foundation/sha256';
import { fileURLToPath } from 'node:url';
const source = fileURLToPath(new URL('../', import.meta.url));
const files = await read(source);
const cases = [
  ['receipt signature removed','auth.mjs', "if (!await subtle.verify('RSASSA-PKCS1-v1_5'", "if (false && !await subtle.verify('RSASSA-PKCS1-v1_5'", 'auth.test.mjs','modified signature'],
  ['webhook signature removed','auth.mjs', "if (!await subtle.verify('HMAC'", "if (false && !await subtle.verify('HMAC'", 'auth.test.mjs','webhook refuses tamper'],
  ['receipt bindings removed','auth.mjs', "if (!['string', 'number'].includes(typeof value) || !['string', 'number'].includes(typeof claims[key]) ||\n          String(claims[key]) !== String(value))", "if (false)", 'auth.test.mjs','incorrect run_attempt'],
  ['workflow source check removed','acquire.mjs','if (sha256(bytes) !== w.sourceDigest)', 'if (false)', 'acquire.test.mjs','source drift'],
  ['same-App suite relationship removed','acquire.mjs','check.check_suite?.id !== raw.check_suite_id ||','', 'acquire.test.mjs','same-App forged child'],
  ['page count replaced by observed length','acquire.mjs','total_count: body.total_count,','total_count: body[field].length,', 'acquire.test.mjs','truncated run page'],
  ['completion verdict replaced by passed','controller.mjs','judgeFullMatrix(acquired.authority, fullManifest(acquired.authority), acquired.evidence, current, judgedAt)', "({ verdict: 'passed', errors: [] })", 'controller.test.mjs','one unfinished required job'],
  ['same-SHA conflict ignored','controller.mjs','const collision = old && old.subject !== subject;', 'const collision = false;', 'controller.test.mjs','same-SHA different PR'],
  ['stale epoch accepted','controller.mjs','return s.epoch === epoch;', 'return true;', 'controller.test.mjs','competing callback'],
  ['establishment-error revocation removed','controller.mjs','if (trustedContext) {','if (false) {','controller.test.mjs','source population'],
  ['observation replaced by start time','acquire.mjs','const observedAt = clock.now();','const observedAt = now;','acquire.test.mjs','terminal observations'],
];
const results = [];
for (let i = 0; i < cases.length; i++) {
  const [name,module,from,to,test,pattern] = cases[i], target = 'github/' + module;
  const text = files[target].toString('utf8');
  if (text.split(from).length !== 2) throw new Error(`mutation anchor not unique: ${name}`);
  const changed = { ...files, [target]: Buffer.from(text.replace(from,to)) };
  const copy = fileURLToPath(new URL(`../../.ci-gates-mutation-${Date.now()}-${process.pid}-${i}/`, import.meta.url));
  await initialize(copy, changed);
  try {
    const run = await execute(process.execPath, ['--test','--test-name-pattern',pattern,`${copy}/github/${test}`], { cwd: source });
    const output = run.stdout + run.stderr;
    const assertion = run.status === 1 && /ERR_ASSERTION/.test(output) && !/SyntaxError|ERR_MODULE_NOT_FOUND/.test(output);
    results.push({ name, module, from, to, test, pattern, exitStatus: run.status, discriminatedByAssertion: assertion });
  } finally {
    await reconcile(copy, { write: [], remove: Object.entries(changed).map(([path,bytes]) => ({path,expect:sha256(bytes)})) });
  }
}
console.log(JSON.stringify({ schema:'kaal.gate-publication-mutations/v1', results }, null, 2));
if (results.some(r => !r.discriminatedByAssertion)) process.exitCode = 1;
