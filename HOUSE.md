# House on nekyia.me

The door is **https://nekyia.me**. That name stands without grok.me.

One Cloudflare Worker (`nekyia`):

- static rooms (`dist/`)
- `POST`/`GET` `/api/aught` — KV, date + number, see `TALLY.md`
- `/api/walk` — WebSocket relay, Durable Object `WalkRoom`. Nothing stored. Nothing logged.

No auth. No database of people. No PWA chrome. No “Made with Grok”.
`src/game/law.ts` is unchanged.

Push to `main` builds and deploys. If Aught or the walk socket fail, the walking still walks.
