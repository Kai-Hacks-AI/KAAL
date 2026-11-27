#!/bin/sh
# Usage: run.sh <repo root>. Loads each patch alone into a scratch copy of packages/kaal-controls and runs Cases T1120 and T1123.
root=$1; here=$(cd "$(dirname "$0")" && pwd)
cases() { for t in F39-ratchet-history/T1120 F39-ratchet-history/T1123; do
  node -e "import('$1/packages/kaal-controls/02-requirements/$t.test.mjs').then(async m=>{try{await m.run();console.log('  '+m.id+' GREEN')}catch(e){console.log('  '+m.id+' RED:',e.message.split('\n')[0])}})"; done; }
echo "ratchet.mjs $(git hash-object "$root/packages/kaal-controls/skills/kaal-controls/scripts/ratchet.mjs") on parent $(git -C "$root" rev-parse --short HEAD)"; echo "baseline (no mutation)"; cases "$root"
for p in "$here"/[PR]*.patch; do
  s=$(mktemp -d); mkdir -p "$s/packages"; cp -r "$root/packages/kaal-controls" "$s/packages/"
  (cd "$s" && patch -s -p1 < "$p") || { echo "patch $p did not apply"; continue; }
  echo "$(basename "$p" .patch)"; cases "$s"; rm -rf "$s"
done
