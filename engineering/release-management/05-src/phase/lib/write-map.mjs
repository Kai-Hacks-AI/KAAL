// The write map, matched: does a path lie in the folders and files of a route, relative to a capability root? Pure over its arguments; the data is in write-map.json.
// A folder is a prefix that ends in '/'; a file is an exact path; '*' stands for exactly one segment in both.

// Does the path lie in the folder? Every segment of the folder matches the same segment of the path, '*' matching any one.
export function inFolder(path, folder) {
  const f = folder.split('/').slice(0, -1);
  const p = path.split('/');
  return p.length > f.length && f.every((s, i) => s === '*' || s === p[i]);
}

// Is the path exactly the file? Every segment matches, '*' matching any one.
export function isFile(path, file) {
  const f = file.split('/');
  const p = path.split('/');
  return p.length === f.length && f.every((s, i) => s === '*' || s === p[i]);
}

// The path relative to the longest capability root it lies under, or undefined when it lies under none.
export function relativeToRoot(path, roots) {
  const norm = roots.map((r) => (r.endsWith('/') ? r.slice(0, -1) : r)).sort((a, b) => b.length - a.length);
  const r = norm.find((x) => path.startsWith(`${x}/`));
  return r === undefined ? undefined : path.slice(r.length + 1);
}

// Does the path lie in the row of a route, under a capability root?
export function inRoute(path, { folders = [], files = [] }, roots) {
  const rel = relativeToRoot(path, roots);
  return rel !== undefined && (folders.some((f) => inFolder(rel, f)) || files.some((f) => isFile(rel, f)));
}
