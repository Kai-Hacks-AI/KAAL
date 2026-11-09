// Shim (F20, a temporary Delivery change requirement): the Release engine moved to engineering/release-management/05-src/release-engine/.
// A full facade of the old interface. Kept because other capabilities' Cases still import this path; goes with its last caller.
export * from "../release-management/05-src/release-engine/release.mjs";
