#!/bin/sh
set -eu
cd /workspace

if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
  exit 0
fi

if [ ! -d node_modules/three ]; then
  npm install three @types/three zustand
fi

npm run dev -- --host 0.0.0.0 --port 8080 >/tmp/nekyia-dev.log 2>&1 &

i=0
while [ "$i" -lt 40 ]; do
  if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
    exit 0
  fi
  i=$((i + 1))
  sleep 0.4
done

exit 0
