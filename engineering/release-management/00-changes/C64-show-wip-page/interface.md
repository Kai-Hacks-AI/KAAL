# C64 interface

The drafts of the four files, as they are added in the DO. The Cases T840 to T843 judge the files themselves at their places; they are not files of `main` until the DO. `cvi.json` is copied from the public repository ChBrain/website (`src/styles/tokens.css`, `src/lib/brand.ts`, `public/favicon.svg`), read-only.

## Draft of page.mjs

`````
// Show WIP page: the text of Show WIP as one static HTML page in the corporate visual identity.
// Pure: the theme, a title, a time and named sections in, the page out. Static: no script, no external origin, text escaped.
// Identity rules kept: warm paper ground, ink text, brick only in the mark (one accent per surface), the mark no smaller than 28 px, no dash as a sentence break.
const escape = (text) => String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

export function renderPage({ theme, title, generated, sections }) {
  const { color: c, font: f } = theme;
  const body = sections.map((s) => `<section>\n<h2>${escape(s.title)}</h2>\n<pre>${escape(s.text)}</pre>\n</section>`).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:">
<title>${escape(title)}</title>
<style>
:root { --paper: ${c.paper}; --paper-warm: ${c.paperWarm}; --ink: ${c.ink}; --ink-soft: ${c.inkSoft}; --ink-mute: ${c.inkMute}; --rule: ${c.rule}; --sea: ${c.sea}; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--paper); color: var(--ink); font-family: ${f.prose}; line-height: 1.55; }
main { max-width: 1080px; margin: 0 auto; padding: 2rem 1rem 4rem; }
header { display: flex; align-items: center; gap: 1rem; border-bottom: 1px solid var(--rule); padding-bottom: 1.25rem; margin-bottom: 1.5rem; }
header svg { height: ${theme.markHeight}px; width: ${theme.markHeight}px; flex: none; }
h1 { font-family: ${f.display}; font-weight: 540; font-size: 1.875rem; margin: 0; }
.eyebrow { font-family: ${f.mono}; font-size: 0.75rem; color: var(--ink-mute); margin: 0; }
h2 { font-family: ${f.display}; font-weight: 540; font-size: 1.375rem; color: var(--sea); margin: 2rem 0 0.5rem; }
pre { font-family: ${f.mono}; font-size: 0.8125rem; background: var(--paper-warm); border: 1px solid var(--rule); padding: 1rem; overflow-x: auto; white-space: pre; margin: 0; }
footer { font-family: ${f.mono}; font-size: 0.75rem; color: var(--ink-mute); border-top: 1px solid var(--rule); margin-top: 2rem; padding-top: 1rem; }
</style>
</head>
<body>
<main>
<header>
${theme.mark}
<div>
<p class="eyebrow">kaal, operations</p>
<h1>${escape(title)}</h1>
</div>
</header>
${body}
<footer>Read from the repository at ${escape(generated)}. It shows where work stands and authorizes nothing.</footer>
</main>
</body>
</html>
`;
}
`````

## Draft of build-page.mjs

`````
// Usage: node build-page.mjs <cvi.json> <out.html> <generated> <Title=file>...
// Builds the Show WIP page. Every input is read first; if one cannot be read, or is empty, it prints what and exits 2 without writing the page.
import { readFileSync, writeFileSync } from 'node:fs';
import { renderPage } from './page.mjs';

try {
  const [themeFile, out, generated, ...parts] = process.argv.slice(2);
  if (!themeFile || !out || !generated || parts.length === 0) throw new Error('could not start: expected <cvi.json> <out.html> <generated> <Title=file>...');
  if (Number.isNaN(Date.parse(generated))) throw new Error(`could not read the time ${generated}`);
  const read = (file) => {
    let text;
    try { text = readFileSync(file, 'utf8'); } catch { throw new Error(`could not read ${file}`); }
    if (!text.trim()) throw new Error(`${file} is empty`);
    return text;
  };
  const theme = JSON.parse(read(themeFile));
  const sections = parts.map((p) => {
    const at = p.indexOf('=');
    if (at < 1) throw new Error(`${p} is not Title=file`);
    return { title: p.slice(0, at), text: read(p.slice(at + 1)) };
  });
  writeFileSync(out, renderPage({ theme, title: 'Show WIP', generated, sections }));
} catch (error) {
  console.error(`build page: ${error.message}`);
  process.exitCode = 2;
}
`````

## Draft of cvi.json

`````
{
  "source": "ChBrain/website: src/styles/tokens.css, src/lib/brand.ts, public/favicon.svg (CVI v0.1.0)",
  "color": {
    "paper": "#f3ede2",
    "paperWarm": "#fbf7ee",
    "paperDeep": "#ede5d4",
    "ink": "#16130f",
    "inkSoft": "#5b5246",
    "inkMute": "#8a8275",
    "rule": "#c9bea7",
    "ruleSoft": "#e6dfd0",
    "brick": "#8d3a2c",
    "sea": "#3a4a52",
    "amber": "#c98e36"
  },
  "font": {
    "prose": "\"Source Serif 4\", Georgia, \"Times New Roman\", serif",
    "display": "\"Newsreader\", \"Source Serif 4\", Georgia, serif",
    "mono": "\"IBM Plex Mono\", ui-monospace, \"SF Mono\", Menlo, Consolas, monospace"
  },
  "mark": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-25 50 255 255\" width=\"256\" height=\"256\">\n  <rect x=\"-25\" y=\"50\" width=\"255\" height=\"255\" rx=\"40\" fill=\"#f3ede2\"></rect>\n  <path d=\"M688.5571899414062 28.7376708984375 812.573974609375 59.31689453125V687.8363037109375Q812.573974609375 749.3336791992188 792.2597045898438 788.9758605957031Q771.9454345703125 828.6180419921875 730.6065063476562 847.7875061035156Q689.267578125 866.9569702148438 623.9832153320312 866.9569702148438Q558.3053588867188 866.9569702148438 497.23138427734375 849.0771179199219Q436.15740966796875 831.197265625 387.99896240234375 807.9076538085938L378.763916015625 827.7492065429688Q456.47430419921875 897.3336791992188 512.9606628417969 940.2707214355469Q569.447021484375 983.207763671875 614.1574096679688 1005.6694641113281Q658.8677978515625 1028.1311645507812 700.60546875 1036.0655822753906Q742.3431396484375 1044 791.6873168945312 1044Q934.92236328125 1044 1002.5288696289062 966.2240295410156Q1070.1353759765625 888.4480590820312 1070.1353759765625 728.58447265625V60.18572998046875L1196.337890625 28.7376708984375V0H688.5571899414062ZM541.0975952148438 0H33.7376708984375V28.7376708984375L160.22979736328125 60.18572998046875V1263.7387084960938Q147.22979736328125 1272.34521484375 123.87460327148438 1287.47900390625Q100.5194091796875 1302.61279296875 68.5194091796875 1323.3394470214844Q36.5194091796875 1344.0661010742188 -2.4805908203125 1369.8856201171875V1392.2297973632812L407.130126953125 1486.8961181640625H417.79119873046875V980.478515625V59.31689453125L541.0975952148438 28.7376708984375Z\" transform=\"matrix(0.14,0,0,-0.14,60,280)\" fill=\"#c9bea7\"></path>\n  <path d=\"M525.1353759765625 607.3221435546875 613.1836547851562 691.1574096679688 1115.9548950195312 59.76495361328125 1218.8184814453125 28.7376708984375V0H695.6663208007812V28.7376708984375L811.8142700195312 56.02728271484375L429.1353759765625 535.7103881835938H362.51837158203125V589.5299072265625H437.2392578125L895.7859497070312 957.3934936523438L744.1521606445312 991V1024H1150.7418823242188V991L994.763916015625 955.68310546875ZM417.79119873046875 60.18572998046875 541.38720703125 28.7376708984375V0H33.7376708984375V28.7376708984375L160.22979736328125 60.18572998046875V1272.7166748046875Q147.22979736328125 1280.7439575195312 123.87460327148438 1295.0089111328125Q100.5194091796875 1309.2738647460938 68.5194091796875 1328.9868774414062Q36.5194091796875 1348.6998901367188 -2.4805908203125 1373.0713500976562V1395.41552734375L407.130126953125 1486.8961181640625H417.79119873046875V1307.257080078125Z\" transform=\"matrix(0.14,0,0,-0.14,0,280)\" fill=\"#16130f\"></path>\n  <circle cx=\"189.4\" cy=\"93.5\" r=\"21\" fill=\"#8d3a2c\"></circle>\n</svg>",
  "markHeight": 48
}
`````

## Draft of show-wip-page.yml

`````
# Show WIP page (release/C64), as a source in Engineering: a daily Operations job that runs Show WIP and publishes it as one static page on GitHub Pages.
# It reads and shows; it changes no branch, piece or setting. A failed read fails the build and nothing is published: the page is whole or the last one stays.
# This is a source; a WIRE installs it under .github/workflows/ (`.github` travels alone). Pages must be enabled for the repository with the source GitHub Actions, by the Owner.
name: show WIP page

on:
  schedule:
    - cron: "47 5 * * *"
  workflow_dispatch:

permissions:
  contents: read
  pull-requests: read

concurrency:
  group: show-wip-page
  cancel-in-progress: false

jobs:
  build:
    name: build Show WIP page
    if: ${{ github.ref == format('refs/heads/{0}', github.event.repository.default_branch) }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
      - uses: actions/setup-node@949feb2413d6458794dcd2491c4babbbce0c15c1 # v7.1.0
        with:
          node-version: 24
      - name: Run Show WIP
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          mkdir parts site
          node engineering/release-management/05-src/show-wip/run.mjs "$GITHUB_REPOSITORY" engineering/release-management/05-src/show-wip/show-wip.json overview > parts/overview.txt
          node engineering/release-management/05-src/show-wip/run.mjs "$GITHUB_REPOSITORY" engineering/release-management/05-src/show-wip/show-wip.json settled > parts/settled.txt
      - name: Build the page
        run: node engineering/release-management/05-src/show-wip/build-page.mjs engineering/release-management/05-src/show-wip/cvi.json site/index.html "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "Overview=parts/overview.txt" "Settled=parts/settled.txt"
      - uses: actions/upload-pages-artifact@fc324d3547104276b827a68afc52ff2a11cc49c9 # v5.0.0
        with:
          path: site

  deploy:
    name: publish Show WIP page
    needs: build
    if: ${{ github.ref == format('refs/heads/{0}', github.event.repository.default_branch) }}
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@368f82528645a54fb793d4d04e342629a3f51346 # v5.0.1
`````

## What the page is

One static HTML file, `index.html`, built from the text Show WIP prints: a header with the mark and the title, one section per view (Overview, Settled), a footer with the time of the read. The CVI rules it keeps: warm paper ground and ink text, Newsreader for headings, Source Serif 4 for prose and IBM Plex Mono for the lists, sea for the section headings, brick only in the mark (one accent per surface), the mark at 48 px (the floor is 28 px), no dash as a sentence break. It holds no script and no external origin (a content security policy says so); the fonts are named with local fallbacks, so a reader without them sees Georgia and the system monospace.

## What the job is

`show-wip-page.yml` runs once a day (05:47 UTC) and on demand, on the default branch only. The build job holds read rights, runs Show WIP and builds the page; the deploy job needs the build and alone holds `pages: write` and `id-token: write`. A read that fails fails the build, so nothing is published and the last page stays. Every action is pinned to a commit.
