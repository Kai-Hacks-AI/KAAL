import { findControls } from './find-controls.mjs';
// Pure: the caller hands it the `{ path, text }` entries of a ref, read by hosting.
export function registryAt(files, station) {
  return findControls(files).controls.filter((c) => c.valid).flatMap((c) => c.stations.filter((s) => s.station === station).map((s) => ({ id: c.id, title: c.title, mode: s.mode, status: c.status, path: c.path })));
}
