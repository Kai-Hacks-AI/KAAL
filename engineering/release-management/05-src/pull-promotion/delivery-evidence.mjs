// Pull Promotion's DO evidence from the delivery declaration (release/F74). Pure: the declaration it is given is not changed.
// The solution roots stay in Pull Promotion's own declaration; the delivery locations come from the declaration of the delivery architecture.
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function withDelivery(declaration, locations) {
  const patterns = [];
  if (locations.roots.length) patterns.push(`^(?!.*(^|/)plan/)(${locations.roots.map(escape).join('|')})/.+`);
  if (locations.files.length) patterns.push(`^(${locations.files.map(escape).join('|')})$`);
  return { ...declaration, evidence: { ...declaration.evidence, do: [...(declaration.evidence?.do ?? []), ...patterns] } };
}
