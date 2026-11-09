// Shim (F20, a temporary Delivery change requirement): the Release engine moved to engineering/release-management/05-src/release-engine/.
// A full facade of the old interface. Kept because other capabilities' Cases still import this path; is removed in a later Engineering Change once its last caller is rewired.
export * from "../release-management/05-src/release-engine/release.mjs";
