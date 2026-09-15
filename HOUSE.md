# House on nekyia.me

The name stands without grok.me.

One Cloudflare Worker:

- static rooms (`dist/`)
- `POST`/`GET` `/api/aught` — KV, date + number, see `TALLY.md`
- `/api/walk` — WebSocket relay, Durable Object `WalkRoom`. Nothing stored. Nothing logged.

No auth. No database of people. No PWA chrome. No “Made with Grok”.
`src/game/law.ts` is unchanged.

## Build the rooms

```
npm run build:house
```

## Seat the worker

1. Create KV: `npx wrangler kv namespace create AUGHT`
2. Put the id in `wrangler.toml` (`REPLACE_WITH_WRANGLER_KV_ID`)
3. `npx wrangler deploy`
4. Point nekyia.me DNS to this worker (custom domain on the worker)

If Aught or the walk socket fail, the walking still walks.
