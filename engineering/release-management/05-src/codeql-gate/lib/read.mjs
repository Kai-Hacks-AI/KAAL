// The only reader of the CodeQL gate: pages the code-scanning analyses and the open alerts of one sha and ref. `fetchJson(url)` is an argument, so no Case touches the network.
const pages = async (fetchJson, path) => {
  const all = [];
  for (let page = 1; ; page += 1) {
    const rows = await fetchJson(`${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${page}`);
    if (!Array.isArray(rows)) throw new Error(`${path}: the answer is not a list`);
    all.push(...rows);
    if (rows.length < 100) return all;
  }
};
export const readAnalyses = (fetchJson, { repository, sha, ref }) => pages(fetchJson, `/repos/${repository}/code-scanning/analyses?sha=${sha}&ref=${encodeURIComponent(ref)}`);
export const readAlerts = (fetchJson, { repository, ref }) => pages(fetchJson, `/repos/${repository}/code-scanning/alerts?ref=${encodeURIComponent(ref)}&state=open`);

export function fetchJsonOf(token, fetchImpl = fetch) {
  return async (path) => {
    const response = await fetchImpl(`https://api.github.com${path}`, { headers: { accept: 'application/vnd.github+json', authorization: `Bearer ${token}`, 'x-github-api-version': '2022-11-28' } });
    if (!response.ok) throw new Error(`${path}: ${response.status}`);
    return response.json();
  };
}
