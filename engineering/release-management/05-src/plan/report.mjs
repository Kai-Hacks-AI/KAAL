// A11 reporter: a verdict of PASS, FAIL or UNKNOWN, with findings and a Recovery for every one.
export function report(findings) {
  const complete = findings.map((finding) => ({ ...finding, recovery: finding.recovery || `Fix ${finding.id} and run verify Plan again.` }));
  const verdict = complete.some((finding) => finding.status === 'fail') ? 'FAIL' : complete.some((finding) => finding.status === 'unknown') ? 'UNKNOWN' : 'PASS';
  return { verdict, findings: complete };
}
