#!/bin/sh
# Usage: run.sh <repo root>. Loads each patch alone into a scratch copy of packages/kaal-controls and runs Cases T1108 to T1117.
root=$1; here=$(cd "$(dirname "$0")" && pwd)
cases() { for t in F34-modes-judged/T1108 F34-modes-judged/T1109 F34-modes-judged/T1110 F34-modes-judged/T1112 F34-modes-judged/T1113 F34-modes-judged/T1114 F35-cli-says-unknown/T1115 F35-cli-says-unknown/T1116 F36-ratchet-lifecycle/T1117; do
  node -e "import('$1/packages/kaal-controls/02-requirements/$t.test.mjs').then(async m=>{try{await m.run();console.log('  '+m.id+' GREEN')}catch(e){console.log('  '+m.id+' RED:',e.message.split('\n')[0])}})"; done; }
echo "baseline (no mutation)"; cases "$root"
for p in "$here"/M*.patch; do
  s=$(mktemp -d); mkdir -p "$s/packages"; cp -r "$root/packages/kaal-controls" "$s/packages/"
  (cd "$s" && patch -s -p1 < "$p") || { echo "patch $p did not apply"; continue; }
  echo "$(basename "$p" .patch)"; cases "$s"; rm -rf "$s"
done
