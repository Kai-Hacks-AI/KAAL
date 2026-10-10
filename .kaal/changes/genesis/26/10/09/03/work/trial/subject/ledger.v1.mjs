export function createLedger() {
  const items = [];
  return {
    append(entry) {
      const id = items.length + 1;
      items.push({ id, entry });
      return id;
    },
    retract(id) {
      const at = items.findIndex((item) => item.id === id);
      if (at < 0) return false;
      items.splice(at, 1);
      return true;
    },
    ids() {
      return items.map((item) => item.id);
    },
  };
}
