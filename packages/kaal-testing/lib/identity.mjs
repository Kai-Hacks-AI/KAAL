// The identity of the content a record of evidence is about (testing/F177). Pure: reads no file, no environment and no source.
const isIdentity = (x) => typeof x === 'string' && x.trim() !== '';

/** checkIdentity({ recorded, examined }) -> { ok, findings }. examined: the identity of the content the consumer examined; recorded: the identity a record names. */
export function checkIdentity({ recorded, examined } = {}) {
  const findings = [];
  if (!isIdentity(examined)) findings.push({ kind: 'examined-identity-missing', detail: 'the examined identity is missing or blank' });
  if (!isIdentity(recorded)) findings.push({ kind: 'recorded-identity-missing', detail: 'the recorded identity is missing or blank' });
  if (findings.length === 0 && recorded !== examined) findings.push({ kind: 'recorded-not-examined', detail: `the record names ${recorded}, and the examined content is ${examined}` });
  return { ok: findings.length === 0, findings };
}
