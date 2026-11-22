#!/bin/sh
# Usage: run.sh <repo root>. Loads each patch alone into a scratch copy of packages/kaal-controls and runs Cases T1108 to T1114.
root=$1; here=$(cd "$(dirname "$0")" && pwd)
cases() { for t in T1108 T1109 T1110 T1112 T1113 T1114; do
  node -e "import('$1/packages/kaal-controls/02-requirements/F34-modes-judged/$t.test.mjs').then(async m=>{try{await m.run();console.log('  $t GREEN')}catch(e){console.log('  $t RED:',e.message.split('\n')[0])}})"; done; }
echo "baseline (no mutation)"; cases "$root"
for p in "$here"/M*.patch; do
  s=$(mktemp -d); mkdir -p "$s/packages"; cp -r "$root/packages/kaal-controls" "$s/packages/"
  (cd "$s" && patch -s -p1 < "$p") || { echo "patch $p did not apply"; continue; }
  echo "$(basename "$p" .patch)"; cases "$s"; rm -rf "$s"
done
