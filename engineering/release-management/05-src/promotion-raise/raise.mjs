// Raises a PROMOTION from a decision that was read strictly (release/C73, release/I40). The only write is the creation of a pull request.
const plain = (text, max) => String(text ?? '').replace(/[^A-Za-z0-9 .,'/*:()_#\n-]/g, '').slice(0, max);
// The body is read by its structure, not filtered as free text (release/C116): the chapters of a decision, in order, and in HOW TO WORK nothing but the rows of a table.
const CHAPTERS = [['Change', 'Why now'], ['Change', 'Reason'], ['Change', 'Why now', 'HOW TO WORK']];
const table = (text) => {
  const lines = String(text).split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length < 3 || !lines.every((l) => /^\|.*\|$/.test(l))) return null;
  return `\n${lines.map((l) => l.replace(/[^A-Za-z0-9 .,'/*:()_#|;<>\u2014-]/g, '')).join('\n')}\n`.slice(0, 4000);
};
export function readBody(body) {
  const parts = String(body ?? '').split(/^## /m);
  if (parts[0].trim() !== '') return null;
  const chapters = parts.slice(1).map((p) => { const nl = p.indexOf('\n'); return { name: (nl < 0 ? p : p.slice(0, nl)).trim(), text: nl < 0 ? '' : p.slice(nl + 1) }; });
  const names = chapters.map((c) => c.name);
  if (!CHAPTERS.some((c) => c.length === names.length && c.every((n, i) => n === names[i]))) return null;
  const out = chapters.map((c) => (c.name === 'HOW TO WORK' ? table(c.text) : plain(c.text, 2000)));
  if (out.includes(null)) return null;
  return chapters.map((c, i) => `## ${c.name}\n${out[i]}`).join('');
}
const COLLECTOR = /^(?:kaal\/[a-z0-9-]+\/[a-z0-9-]+|hotfix\/[a-z0-9-]+|wire\/[a-z0-9-]+)$/;
export const marker = (head, revision) => `\n<!-- kaal-dispatch: ${head}@${revision} -->\n`;
export function readDecision(d) {
  if (!d || d.action !== 'raise') return { ok: false, why: 'not a raise' };
  if (typeof d.head !== 'string' || !COLLECTOR.test(d.head)) return { ok: false, why: 'the head is not an integration branch' };
  if (d.base !== 'main') return { ok: false, why: 'the base is not main' };
  if (typeof d.revision !== 'string' || !/^[0-9a-f]{40}$/.test(d.revision)) return { ok: false, why: 'the revision is not a commit' };
  if (typeof d.title !== 'string' || d.title.includes('\n') || !d.title.startsWith('PROMOTION: ')) return { ok: false, why: 'the title is not a PROMOTION' };
  const body = readBody(d.body);
  if (body === null) return { ok: false, why: 'the body is not the chapters of a promotion' };
  return { ok: true, value: { title: plain(d.title, 200), head: d.head, base: 'main', body: body + marker(d.head, d.revision), revision: d.revision } };
}
export async function raiseAll({ api, repo, decisions, live }) {
  const out = [];
  for (const d of decisions) {
    if (!d || d.action !== 'raise') { out.push({ result: 'none' }); continue; }
    const r = readDecision(d);
    if (!r.ok) { out.push({ result: 'refused', why: r.why }); continue; }
    const v = r.value, mark = marker(v.head, v.revision).trim();
    // The look: a PROMOTION of this very revision, open, closed or merged, is not made again.
    const seen = await api('GET', `repos/${repo}/pulls?state=all&head=${repo.split('/')[0]}:${v.head}&base=main&per_page=30`);
    if (seen.some((p) => String(p.body ?? '').includes(mark))) { out.push({ result: 'already-raised', head: v.head }); continue; }
    // Freshness: the tip read right before the write must be the revision that was evaluated.
    let tip = null;
    try { tip = (await api('GET', `repos/${repo}/git/ref/heads/${v.head}`)).object.sha; } catch { tip = null; }
    if (tip !== v.revision) { out.push({ result: 'moved', head: v.head }); continue; }
    if (!live) { out.push({ result: 'would-raise', head: v.head, title: v.title }); continue; }
    try {
      const p = await api('POST', `repos/${repo}/pulls`, { title: v.title, head: v.head, base: v.base, body: v.body, draft: true });
      const found = p.head && p.head.sha;
      out.push(found === v.revision ? { result: 'raised', head: v.head, number: p.number } : { result: 'raised-moved', head: v.head, number: p.number, evaluated: v.revision, found });
    } catch (e) {
      // GitHub keeps one open pull request per head and base: the refusal of a second one is the answer.
      if (e && e.status === 422 && /pull request already exists/i.test(String(e.message))) out.push({ result: 'exists', head: v.head });
      else throw e;
    }
  }
  return out;
}
