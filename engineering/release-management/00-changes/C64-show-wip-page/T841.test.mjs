// Case release/T841 tests: release/C64
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { THEME, theme } from './fixtures.mjs';
export const id = 'release/T841';
export const tests = ['release/C64'];
export const title = 'the theme file holds the identity palette, type families and mark, the mark no smaller than 28 px, with the accent only in the mark';
export async function run() {
  assert.ok(existsSync(THEME), 'cvi.json is absent from 05-src/show-wip');
  const t = theme();
  const expected = { paper: '#f3ede2', paperWarm: '#fbf7ee', ink: '#16130f', inkSoft: '#5b5246', inkMute: '#8a8275', rule: '#c9bea7', brick: '#8d3a2c', sea: '#3a4a52' };
  for (const [name, hex] of Object.entries(expected)) assert.equal(t.color?.[name], hex, `the colour ${name} is not ${hex}`);
  for (const [name, hex] of Object.entries(t.color)) assert.match(hex, /^#[0-9a-f]{6}$/, `the colour ${name} is not a hex value`);
  for (const [name, family] of Object.entries({ display: 'Newsreader', prose: 'Source Serif 4', mono: 'IBM Plex Mono' })) assert.ok(t.font?.[name]?.includes(family), `the ${name} family is not ${family}`);
  assert.match(t.mark, /^<svg[\s>]/, 'the mark is not an inline svg');
  assert.ok(t.mark.includes(t.color.brick), 'the mark does not carry the brick dot');
  assert.ok(!/<script|href=|https?:\/\/(?!www\.w3\.org)/i.test(t.mark), 'the mark holds a script or a reference');
  assert.ok(t.markHeight >= 28, 'the mark is smaller than 28 px');
}
