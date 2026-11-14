// Test-only challenge of a 4L result record against references/4l.md's result expectations.
// Applies to records that claim Method: 4L. Not a schema for other methods, and not shipped.
const CATS = ['Liked', 'Learned', 'Lacked', 'Longed For'];
const LABEL = /^- (Observation|Interpretation|Potential improvement):/;

export function challenge4l(text) {
  const findings = [];
  const add = (id) => findings.push(id);
  if (!/^Method:\s*4L\b/m.test(text)) add('no-method');
  if (!/^Subject:\s*\S/m.test(text)) add('no-subject');
  if (!/^Participants:\s*\S/m.test(text)) add('no-participants');
  if (!/^Decisions:\s*(None made|.*owner)/mi.test(text)) add('no-decisions-statement');
  for (const c of CATS) {
    const m = text.match(new RegExp(`^## ${c}\\s*$([\\s\\S]*?)(?=^## |^Decisions:|(?![\\s\\S]))`, 'm'));
    if (!m) { add('missing-category'); continue; }
    const lines = m[1].split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) add('empty-category');
    if (lines.length === 1 && /^None raised\.?$/i.test(lines[0])) continue;
    for (const l of lines) if (!LABEL.test(l)) add('unlabeled-entry');
  }
  if (/^- .*\b(approved|decided|assigned to|will be done)\b/mi.test(text)) add('decision-recorded');
  return [...new Set(findings)];
}
