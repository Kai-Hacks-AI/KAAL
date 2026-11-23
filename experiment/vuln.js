// Deliberately vulnerable file for a disposable CodeQL experiment (release/C129). Never merged.
import http from 'node:http';
import { parse } from 'node:url';
http.createServer((req, res) => {
  const code = parse(req.url, true).query.x;
  res.end(String(eval(code)));
}).listen(0);
