# Aught

A UTC date and a whole number. Not a who.

Served at `https://nekyia.me/api/aught`. Not from `src/lib/tally.ts`. Not from Postgres. Not from aught.grok.me.

## Contract

`recordVisit()` → `{ ok }`  
`GET` tally → `{ today, total, days: [{ day, hits }] }`

- `POST /api/aught` increments today’s UTC day in KV. Returns `{ ok: true }` or `{ ok: false }`.
- `GET /api/aught` returns `{ today, total, days }`. `today` is `YYYY-MM-DD` UTC. `hits` is a whole number. No names.

The walking still walks if Aught fails.
