// A second deliberately vulnerable file, introduced by the pull request itself (disposable experiment, never merged).
import http from 'node:http';
import { exec } from 'node:child_process';
import { parse } from 'node:url';
http.createServer((req, res) => {
  exec(`ls ${parse(req.url, true).query.dir}`, (e, out) => res.end(out));
}).listen(0);
