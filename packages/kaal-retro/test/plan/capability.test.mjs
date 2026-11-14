// retro/C2 Cases. Unwired: RED until the DO delivers the Nodes and the corrected claim.
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { bootstrap, catalog, foundation, readContribution, register, registerSkill, verify } from 'kaal-core';
import { identify } from 'kaal-graph';
import { CLAIM_FILE, readClaim } from 'kaal-testing/attribution';

const PACKAGE = fileURLToPath(new URL('../../', import.meta.url));
const CAPABILITY = join(PACKAGE, 'capability');
const PAYLOAD = join(PACKAGE, 'payload');
const COLLECTOR = 'kaal/retro/skill';
const capability = () => identify(readFileSync(join(CAPABILITY, 'Retro.md')));
const skill = () => identify(readFileSync(join(PAYLOAD, 'Retro.md')));

async function admitted() {
  const engine = join(mkdtempSync(join(tmpdir(), 'kaal-retro-')), 'engine');
  await bootstrap(engine);
  const c = await register(engine, 'capability', 'retro', await readContribution(CAPABILITY));
  return { engine, c };
}

describe('retro/C2 the Capability Node', () => {
  it('retro/T11 is named Retro and typed by Core\'s KAAL Capability', () => {
    const node = capability();
    assert.equal(node.name, 'Retro');
    assert.deepEqual(node.type, foundation().capability);
  });
});

describe('retro/C2 admission', () => {
  it('retro/T12 Core admits the Capability on a fresh Engine', async () => {
    const { engine, c } = await admitted();
    assert.deepEqual(c.ids, [capability().id]);
    assert.deepEqual((await catalog(engine)).capabilities, [{ name: 'Retro', id: capability().id }]);
    assert.equal((await verify(engine)).ok, true);
  });

  it('retro/T13 the Skill Node is typed by KAAL Skill and admitted as the skill retro', async () => {
    assert.deepEqual(skill().type, foundation().skill);
    const { engine } = await admitted();
    const s = await registerSkill(engine, 'retro', await readContribution(PAYLOAD));
    assert.deepEqual(s.ids, [skill().id]);
    assert.equal((await verify(engine)).ok, true);
  });
});

describe('retro/C2 ownership', () => {
  it('retro/T14 the claim names the Capability Node by kind, name and exact id and claims the package', () => {
    const claim = readClaim(readFileSync(join(PACKAGE, CLAIM_FILE), 'utf8'));
    assert.deepEqual(claim.owner, { kind: 'capability', name: 'Retro', id: capability().id });
    assert.deepEqual(claim.paths, ['packages/kaal-retro/']);
    assert.doesNotMatch(readFileSync(join(PACKAGE, CLAIM_FILE), 'utf8'), /Learning/);
  });

  it('retro/T15 the collector carries the Capability\'s name as its capability segment', () => {
    const [prefix, segment, concern] = COLLECTOR.split('/');
    assert.equal(prefix, 'kaal');
    assert.equal(segment, capability().name.toLowerCase());
    assert.equal(concern, 'skill');
  });
});
