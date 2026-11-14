// Shared fixtures for the Show WIP v2 Cases. Not a Case. Reuses the v1 fixtures.
import { config as v1config, piece as v1piece } from './fixtures.mjs';
export { showWip, render, readOpenPulls, node, page } from './fixtures.mjs';

export const config = (over = {}) => v1config({
  stations: [{ station: 'Integration', into: 'col/*' }, { station: 'Promotion', into: 'target' }],
  review: { stations: ['Promotion', 'Integration'], types: ['SYNC', 'PROMOTION', 'DO', 'PLAN'], sync: 'SYNC' },
  ...over,
});
// A piece that waits for a reviewer: no approval at its version, green checks, fits, observed head.
export const waiting = (number, over = {}) => v1piece(number, { review: 'none', head: `abcdef${number}000`, landing: true, ...over });
export const typed = (number, type, over = {}) => waiting(number, { title: `${type}: change ${number}`, ...over });
