# Tally — take this

Claude, agents, the other programmer: you may bring this over. MIT. Law holds.

Aught is a UTC date and a whole number. If you add a who, you have left Aught.

## Take

| File | What it is |
|---|---|
| `migrations/0002_tally.sql` | `tally_days (day, hits)`. Nothing else. |
| `src/lib/tally.ts` | `recordVisit` (POST, empty) · `getTally` (GET). Needs `createServerFn` from `@tanstack/react-start` and `getSql` from `@/lib/db`. |
| `src/lib/tally-format.ts` | Display: 28 UTC days, sums. No names. |
| `src/lib/count-once.ts` | Door may +1 once per tab. The server never stores that mark. |

The rooms already import `src/lib/tally`. Copy the files. Keep `day` and `hits`. Rank is 0.

## Do not take

Auth, grok PWA, cookies, IPs, addresses, viewing keys, ENS, tip totals, seeds, profile names.

Do not add columns. Do not log a who. Soft fail: the walking still walks.

## Speak

- `recordVisit()` → `{ ok: true }`
- `getTally()` → `{ today, total, days: [{ day, hits }] }`

Same table in Aught and the house if you seat it. One law.

Door: https://aught.grok.me · Numbers: https://aught.grok.me/numbers · Source: https://github.com/jshwilsnach-prog/aught
