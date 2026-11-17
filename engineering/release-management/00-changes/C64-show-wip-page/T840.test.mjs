// Case release/T840 tests: release/C64
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { GENERATED, PAGE, sections, theme } from './fixtures.mjs';
export const id = 'release/T840';
export const tests = ['release/C64'];
export const title = 'the page renderer returns one static page in the visual identity: the sections and time shown, every text escaped, no script, no external origin, no dash as a sentence break';
export async function run() {
  assert.ok(existsSync(PAGE), 'page.mjs is absent from 05-src/show-wip');
  const { renderPage } = await import(PAGE);
  const t = theme();
  const html = renderPage({ theme: t, title: 'Show WIP', generated: GENERATED, sections });
  assert.match(html, /^<!doctype html>/i);
  for (const s of sections) {
    assert.ok(html.includes(`<h2>${s.title}</h2>`), `the section ${s.title} is not shown`);
    assert.ok(html.includes(s.text), `the text of ${s.title} is not shown`);
  }
  assert.ok(html.includes(GENERATED), 'the time of the read is not shown');
  assert.ok(html.includes(t.color.paper) && html.includes(t.color.ink), 'the page does not use the paper and ink of the theme');
  assert.ok(html.includes('Newsreader') && html.includes('IBM Plex Mono'), 'the page does not name the identity type families');
  const hostile = renderPage({ theme: t, title: '<b>t</b>', generated: GENERATED, sections: [{ title: '"><script>x()</script>', text: '<script>alert(1)</script> & <img src=x onerror=y>' }] });
  assert.ok(!/<script/i.test(hostile), 'text became a script element');
  assert.ok(!hostile.includes('<img'), 'text became an element');
  assert.ok(hostile.includes('&lt;script&gt;alert(1)&lt;/script&gt; &amp;'), 'the text is not shown escaped');
  assert.ok(!/<script/i.test(html), 'the page holds a script');
  assert.ok(!/(?:https?:)?\/\/[a-z0-9.-]+\.[a-z]/i.test(html.replace(/xmlns="[^"]*"/g, '')), 'the page names an external origin');
  assert.ok(!/[–—]/.test(html), 'the page holds an en or em dash');
}
