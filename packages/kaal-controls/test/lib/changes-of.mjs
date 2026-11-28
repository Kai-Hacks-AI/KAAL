// Which Changes of a package are open and which Cases belong to each (controls/F233). Pure: it reads the entries it is given.
// A Case belongs to a Change by the chain Case `tests` -> Requirement `serves` -> Intent <- Change `implements`; a Change is open until its folder holds act.md.
const list = (text, key) => {
  const m = text.match(new RegExp(`^${key}:\\s*\\[([^\\]]*)\\]`, 'm'));
  return m ? m[1].split(',').map((s) => s.trim()).filter(Boolean) : [];
};
const idOf = (text) => text.match(/^id:\s*(\S+)/m)?.[1];

export function changesOf(files) {
  const byPath = new Map(files.map((f) => [f.path, f.text]));
  const requirementsServing = new Map(); // requirement id -> intents
  for (const [path, text] of byPath) if (/^02-requirements\/[^/]+\/F[^/]*\.md$/.test(path) && idOf(text)) requirementsServing.set(idOf(text), list(text, 'serves'));
  const cases = new Map(); // intent id -> Case paths
  for (const [path, text] of byPath) {
    if (!/^02-requirements\/.+\/T\d+\.test\.mjs$/.test(path)) continue;
    const tested = (text.match(/export const tests = \[([^\]]*)\]/)?.[1] ?? '').split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
    for (const requirement of tested) for (const intent of requirementsServing.get(requirement) ?? []) cases.set(intent, [...(cases.get(intent) ?? []), path]);
  }
  const changes = [];
  for (const [path, text] of byPath) {
    const m = path.match(/^00-changes\/([^/]+)\/C\d+\.md$/);
    if (!m || !idOf(text)) continue;
    changes.push({ id: idOf(text), open: !byPath.has(`00-changes/${m[1]}/act.md`), cases: list(text, 'implements').flatMap((i) => cases.get(i) ?? []).sort() });
  }
  return changes.sort((a, b) => (a.id < b.id ? -1 : 1));
}
