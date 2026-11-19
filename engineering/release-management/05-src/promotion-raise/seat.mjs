// The seat: how many pull requests may be open into main at once. A replaceable policy (release/C73; capacity belongs to release/C89), not an invariant of the Dispatcher.
export function readCapacity(value) {
  return /^[1-9]$/.test(String(value ?? '')) ? Number(value) : 1;
}
export function oneAtATime({ decisions, openPromotions, capacity = 1 }) {
  let room = capacity - openPromotions.length;
  return decisions.map((d) => {
    if (d.action !== 'raise') return d;
    if (room > 0) { room -= 1; return d; }
    return { action: 'skip', reason: 'seat-taken', detail: openPromotions.length ? `#${openPromotions[0].number} is open into main` : 'the capacity of this run is used' };
  });
}
