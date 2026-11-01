// Private Engineering SQL schema. Hosting owns process launch; Node's installed
// SQLite driver owns file/locking mechanics. No credentials, network or service.
import { digest } from '../../policy-identity.mjs';
const worker = `
import { DatabaseSync } from 'node:sqlite';
const q = JSON.parse(process.argv[1]);
const db = new DatabaseSync(q.path);
db.exec('PRAGMA busy_timeout=5000; PRAGMA journal_mode=DELETE; PRAGMA synchronous=EXTRA; PRAGMA trusted_schema=OFF;');
const mode = db.prepare('PRAGMA journal_mode').get().journal_mode;
const sync = db.prepare('PRAGMA synchronous').get().synchronous;
if (mode !== 'delete' || sync !== 3) throw new Error('required SQLite modes unavailable');
db.exec('CREATE TABLE IF NOT EXISTS records (k TEXT PRIMARY KEY, revision INTEGER NOT NULL, body TEXT NOT NULL)');
const stop = phase => { if (q.stopAt === phase) process.kill(process.pid,'SIGKILL'); };
if (q.action === 'read') {
  const row = db.prepare('SELECT revision, body FROM records WHERE k=?').get(q.key);
  console.log(JSON.stringify(row ?? {revision:0,body:null}));
} else if (q.action === 'cas') {
  stop('before-begin'); db.exec('BEGIN IMMEDIATE'); stop('after-begin');
  const row = db.prepare('SELECT revision FROM records WHERE k=?').get(q.key);
  if ((row?.revision ?? 0) !== q.expected) {
    db.exec('ROLLBACK'); console.log(JSON.stringify({committed:false}));
  } else {
    db.prepare('INSERT INTO records(k,revision,body) VALUES(?,?,?) ON CONFLICT(k) DO UPDATE SET revision=excluded.revision,body=excluded.body')
      .run(q.key,q.expected+1,q.body);
    stop('after-update'); db.exec('COMMIT'); stop('after-commit');
    console.log(JSON.stringify({committed:true}));
  }
} else throw new Error('invalid storage operation');
db.close();
`;
export function createSqliteStore({ execute, node, cwd, path, initial = () => ({}) }) {
  if (!execute || !node || !cwd || !path || path === ':memory:') throw new TypeError('trusted local persistent SQLite configuration required');
  async function run(query) {
    const input = JSON.stringify({ ...query, path });
    // Bound command-line payloads on Windows as well as Linux/macOS. The pilot
    // must stop at capacity; no truncation, pruning or falling back to memory.
    if (input.length > 24000) throw new Error('local pilot storage capacity exceeded');
    let r;
    try{r=await execute(node, ['--input-type=module','-e',worker,input], { cwd });}
    catch{throw new Error('storage acknowledgement unavailable; reconcile before retry');}
    if (r.status !== 0) throw new Error('storage acknowledgement unavailable; reconcile before retry');
    return JSON.parse(r.stdout);
  }
  return Object.freeze({ async transaction(key, fn) {
    if (typeof key !== 'string' || !key || typeof fn !== 'function') throw new TypeError('storage key/callback required');
    for (let i=0;i<24;i++) {
      const row = await run({action:'read',key});
      const state = row.body === null ? initial() : JSON.parse(row.body);
      const result = fn(state);
      if (result?.then) throw new TypeError('transaction callbacks must be synchronous and side-effect free');
      digest(state); // complete JSON; Foundation is the sole KAAL digest implementation
      const body = JSON.stringify(state);
      if (row.body === body) return structuredClone(result);
      if ((await run({action:'cas',key,expected:row.revision,body})).committed) return structuredClone(result);
    }
    throw new Error('storage contention unresolved');
  } });
}
