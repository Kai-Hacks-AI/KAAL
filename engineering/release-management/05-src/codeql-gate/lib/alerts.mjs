// The findings side of the CodeQL gate (release/I69). Pure over facts: no import, no clock, no network.
// Two threshold dimensions, as the ruleset's code scanning rule carries them: security severity and rule severity.
const SECURITY = { critical: ['critical'], high_or_higher: ['high', 'critical'], medium_or_higher: ['medium', 'high', 'critical'], all: ['low', 'medium', 'high', 'critical'], off: [] };
const RULE = { errors: ['error'], errors_and_warnings: ['error', 'warning'], all: ['error', 'warning', 'note'], off: [] };

// The findings of release/CTL35: an open alert at or above either threshold is `alert:<number>`. An unknown threshold value throws, so the command answers UNKNOWN.
export function alertFindings({ alerts, thresholds }) {
  const security = SECURITY[thresholds?.security], rule = RULE[thresholds?.alerts];
  if (!security || !rule) throw new Error(`unknown threshold: security ${thresholds?.security}, alerts ${thresholds?.alerts}`);
  return alerts
    .filter((a) => a.state === 'open' && (security.includes(a.rule?.security_severity_level) || rule.includes(a.rule?.severity)))
    .map((a) => `alert:${a.number}`)
    .sort();
}
