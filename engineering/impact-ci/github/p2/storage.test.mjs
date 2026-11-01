import test from 'node:test';
import assert from 'node:assert/strict';
import { execute, initialize } from 'kaal-hosting';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createSqliteStore } from './sqlite.mjs';
import { initialProducerState, createProducerService } from './producer.mjs';
import { serviceFixture } from './test-fixtures.mjs';
let serial = 0;
export async function database() {
  const cwd = join(tmpdir(), `kaal-producer-${Date.now()}-${process.pid}-${serial++}`);
  await initialize(cwd, {});
  return { cwd, path: join(cwd,'receipt.db'), node: process.execPath, execute,
    initial: () => ({ count: 0, nonce: null, jti: null, fact: null }) };
}
test('SQLite commits are read after constructing a new store/process', async () => {
  const config = await database(), store = createSqliteStore(config);
  await store.transaction('receipts', s => { s.count++; return s.count; });
  const restarted = createSqliteStore(config);
  assert.equal(await restarted.transaction('receipts', s => s.count), 1);
});
test('concurrent independent stores cannot lose committed updates', async () => {
  const config = await database();
  let started=0,finished=0,release;const barrier=new Promise(r=>{release=r;});
  config.execute=async(...args)=>{
    const first=JSON.parse(args[1].at(-1)).action==='read'&&started++<6;
    const out=await execute(...args);
    if(first){if(++finished===6)release();await barrier;}return out;
  };
  await Promise.all(Array.from({length:6}, () => createSqliteStore(config).transaction('receipts', s => ++s.count)));
  assert.equal(await createSqliteStore(config).transaction('receipts', s => s.count), 6);
});
for(const phase of ['before-begin','after-begin','after-update','after-commit'])test(`interrupted SQLite writer ${phase} leaves one atomic receipt state`,async()=>{
  const config=await database(),normal=createSqliteStore(config);
  await normal.transaction('receipts',s=>s.count);
  const faulty=createSqliteStore({...config,execute:async(command,args,options)=>{
    const query=JSON.parse(args.at(-1));
    if(query.action==='cas'){query.stopAt=phase;args=[...args.slice(0,-1),JSON.stringify(query)];}
    return execute(command,args,options);
  }});
  await assert.rejects(faulty.transaction('receipts',s=>{s.nonce='consumed';s.jti='consumed';s.fact='sealed';return 1;}),/acknowledgement/);
  const read=await createSqliteStore(config).transaction('receipts',s=>s);
  if(phase==='after-commit')assert.deepEqual([read.nonce,read.jti,read.fact],['consumed','consumed','sealed']);
  else assert.deepEqual([read.nonce,read.jti,read.fact],[null,null,null]);
});
test('real SQLite receipt survives restart and expiry, with one fact under concurrent duplicate ingress',async()=>{
  const config={...await database(),initial:initialProducerState};
  const h=serviceFixture(createSqliteStore(config)),p=await h.prepare();
  const r=await Promise.all([h.service.ingest(p.challenge.nonce,p.jwt,h.proof),h.service.ingest(p.challenge.nonce,p.jwt,h.proof)]);
  assert.deepEqual(r.map(x=>x.state).sort(),['accepted','acknowledged']);
  h.f.h.f.now+=180000;
  h.ports.store=createSqliteStore(config);h.service=createProducerService(h.ports);
  assert.equal((await h.service.read(r[0].factId)).state,'verified');
  assert.equal((await h.service.ingest(p.challenge.nonce,p.jwt,h.proof)).state,'acknowledged');
});
test('SQLite callback rejection and unreadable database never fall back to an empty successful store',async()=>{
  const config=await database(),store=createSqliteStore(config);
  await assert.rejects(store.transaction('receipts',async()=>1),/synchronous/);
  await assert.rejects(createSqliteStore({...config,path:join(config.cwd,'missing','db')}).transaction('receipts',s=>s.count),/acknowledgement/);
});
test('local pilot storage capacity is refused without truncating or overwriting prior state',async()=>{
  const config=await database(),store=createSqliteStore(config);
  await assert.rejects(store.transaction('receipts',s=>{s.pad='x'.repeat(25000);return 1;}),/capacity/);
  assert.equal(await createSqliteStore(config).transaction('receipts',s=>s.count),0);
});
test('lost local fact commit acknowledgement reconciles nonce/JTI exactly once after restart',async()=>{
  const config={...await database(),initial:initialProducerState};let stopped=false;
  const faulty={...config,execute:async(command,args,options)=>{
    const q=JSON.parse(args.at(-1));
    if(!stopped&&q.action==='cas'&&Object.keys(JSON.parse(q.body).facts??{}).length){
      stopped=true;q.stopAt='after-commit';args=[...args.slice(0,-1),JSON.stringify(q)];
    }
    return execute(command,args,options);
  }};
  const h=serviceFixture(createSqliteStore(faulty)),p=await h.prepare();
  assert.equal((await h.service.ingest(p.challenge.nonce,p.jwt,h.proof)).state,'unresolved');
  h.f.h.f.now+=180000;h.ports.store=createSqliteStore(config);h.service=createProducerService(h.ports);
  const ack=await h.service.ingest(p.challenge.nonce,p.jwt,h.proof);assert.equal(ack.state,'acknowledged');
  assert.equal((await h.service.read(ack.factId)).state,'verified');
});
