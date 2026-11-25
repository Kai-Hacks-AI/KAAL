// backlog/F1 to F3, N1: judges a set of backlog items supplied by the caller. Pure: it reads nothing and imports nothing.
// An item is a plain object { id, title, body, owner?, tests? }. The result is { verdict, findings }: any fault refuses the whole set.
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*\/B[1-9][0-9]*$/;

export function check(items) {
  const findings = [];
  const seen = new Set();
  const list = Array.isArray(items) ? items : [];
  if (!Array.isArray(items)) findings.push({ code: 'not-a-set' });
  for (const item of list) {
    const id = item !== null && typeof item === 'object' ? item.id : undefined;
    if (item === null || typeof item !== 'object') { findings.push({ code: 'malformed-item' }); continue; }
    if (typeof id !== 'string' || !ID.test(id)) findings.push({ code: 'malformed-id', id });
    if (typeof item.title !== 'string' || item.title.trim() === '') findings.push({ code: 'missing-title', id });
    if (Object.hasOwn(item, 'state')) findings.push({ code: 'stored-state', id });
    if (typeof id === 'string') {
      if (seen.has(id)) findings.push({ code: 'duplicate-id', id });
      seen.add(id);
    }
  }
  return { verdict: findings.length === 0 ? 'accepted' : 'refused', findings };
}
